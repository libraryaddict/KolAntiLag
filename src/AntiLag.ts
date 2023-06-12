import {
  choiceFollowsFight,
  currentRound,
  fightFollowsChoice,
  getProperty,
  handlingChoice,
  inMultiFight,
  myHash,
  print,
  setProperty,
  toBoolean,
  toInt,
  userConfirm,
  visitUrl,
  wait,
} from "kolmafia";

class AntiLag {
  lastLagTests = "lastLagRecords";
  lastLagTested = "_lastLagTested";
  thisSessionLag = "_thisSessionLag";
  testsBeforeFailing: number;
  maxToStore: number;
  testsToStartWith: number;
  cacheMinuteExpires: number;
  warnCantFind: boolean;
  lastLogin: number = 0;

  constructor() {
    this.updateNumbers();
  }

  updateNumbers() {
    const getProp = <T>(s: string, def: T): T => {
      if (typeof def == "number") {
        if (!getProperty(s).match(/^\d+$/)) {
          setProperty(s, def.toString());
        }

        return toInt(getProperty(s)) as T;
      } else if (typeof def == "boolean") {
        if (!getProperty(s).match(/^true|false$/)) {
          setProperty(s, def.toString());
        }

        return toBoolean(getProperty(s)) as T;
      } else {
        throw "Unknown type";
      }
    };

    this.testsToStartWith = getProp("antilag_min_dataset", 5);
    this.testsBeforeFailing = getProp("antilag_max_attempts", 5);
    this.cacheMinuteExpires = getProp("antilag_cache_minutes", 15);
    this.maxToStore = Math.max(
      this.testsToStartWith,
      getProp("antilag_max_stored", 15)
    );
    this.warnCantFind = getProp("antilag_warn_attempts_failed", true);
  }

  getCurrentLag() {
    const getParkaNext = () => {
      return getProperty("parkaMode") == "spikolodon"
        ? "kachungasaur"
        : "spikolodon";
    };

    const started = Date.now();

    for (let i = 0; i < 5; i++) {
      visitUrl("council.php");
      //cliExecute("parka " + getParkaNext());
    }

    return Date.now() - started;
  }

  getLastTests(): number[] {
    return getProperty(this.lastLagTests)
      .split(",")
      .filter((s) => s.length > 0)
      .map((s) => toInt(s));
  }

  saveLastTests(test: number[]) {
    setProperty(this.lastLagTests, test.join(","));
  }

  relog() {
    const hash = myHash();

    try {
      visitUrl("logout.php");
    } catch (ignored) {
      // Ignored
    }

    let i = 0;

    while (true) {
      try {
        if (myHash().length > 0 && hash != myHash()) {
          break;
        }

        if (i++ > 0 || Date.now() - this.lastLogin < 30_000) {
          wait(30);
        }

        print("Trying to log in..", "gray");
        visitUrl("main.php");
        this.lastLogin = Date.now();
      } catch (e) {
        if (!("" + e).includes("Too many server redirects")) {
          throw e;
        }
      }
    }
  }

  isSafeToRun() {
    if (currentRound() != 0) {
      return false;
    }

    if (handlingChoice() || choiceFollowsFight() || fightFollowsChoice()) {
      return false;
    }

    if (inMultiFight()) {
      return false;
    }

    return true;
  }

  hasTestedThisSession() {
    const setting = getProperty(this.lastLagTested).split("|");

    if (setting.length != 2) {
      return false;
    }

    if (setting[0] != myHash()) {
      return false;
    }

    const diff = Date.now() - toInt(setting[1]);
    const expiresAfter = 1000 * 60 * this.cacheMinuteExpires;

    if (diff > expiresAfter) {
      return false;
    }

    return true;
  }

  getSessionLag() {
    if (!this.hasTestedThisSession()) {
      const current = this.getCurrentLag();
      setProperty(this.thisSessionLag, current.toString());
      setProperty(this.lastLagTested, myHash() + "|" + Date.now());

      const tests = [current, ...this.getLastTests()];

      if (tests.length > this.maxToStore) {
        tests.pop();
      }

      this.saveLastTests(tests);
    }

    return toInt(getProperty(this.thisSessionLag));
  }

  getBestLatency() {
    const lastTests = this.getLastTests();

    if (lastTests.length == 0) {
      return 10_000;
    }

    return lastTests.reduce((l, r) => Math.min(l, r));
  }

  getIdealLatency() {
    return Math.ceil(this.getBestLatency() * 1.1);
  }

  isGoodSession() {
    const current = this.getSessionLag();

    return this.getIdealLatency() > current;
  }

  ensureLowLag() {
    const attempts = [];
    const fillingData = () =>
      this.getLastTests().length < this.testsToStartWith;

    while (fillingData() || !this.isGoodSession()) {
      attempts.push(this.getSessionLag());

      print(
        `Current latency of ${this.getNumber(
          this.getSessionLag()
        )}ms, minimum is ${this.getNumber(
          Math.round(this.getIdealLatency())
        )}ms`,
        "blue"
      );

      if (fillingData()) {
        print(
          "Currently filling data, need " +
            (this.testsToStartWith - this.getLastTests().length) +
            " more data points..",
          "gray"
        );
      }

      if (
        attempts.length >= this.testsBeforeFailing &&
        this.getLastTests().length >= this.testsToStartWith
      ) {
        const msg =
          "Done " + attempts.length + " attempts, but it isn't getting better.";

        if (!this.warnCantFind) {
          print(msg + " Won't make anymore attempts.", "red");
          break;
        }

        if (userConfirm(msg + " Abort?\n" + attempts.join(" > "))) {
          throw "Abort requested";
        }
      }

      this.relog();
    }

    print(
      `Currently ${this.getNumber(this.getSessionLag())}ms, ${
        this.getSessionLag() <= this.getBestLatency() ? "reached" : "failed"
      } goal of under ${this.getNumber(
        this.getIdealLatency()
      )}ms. Ideal is ${this.getNumber(this.getBestLatency())}ms`,
      "blue"
    );
  }

  getNumber(num: number) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}

export function main() {
  new AntiLag().ensureLowLag();
}
