import {
  Item,
  availableAmount,
  choiceFollowsFight,
  cliExecute,
  currentRound,
  equip,
  equippedAmount,
  fightFollowsChoice,
  getProperty,
  getRevision,
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
  pref_lastLagTests = "antilag_lag_history";
  pref_lastLagTested = "_antilag_last_lag_test";
  pref_thisSessionLag = "_antilag_current_session_lag";
  pref_useElvishGlasses = "antilag_use_elvish_sunglasses";
  pref_antilagCache = "antilag_use_cached_session_lag";
  pref_differentConnection = "antilag_reset_different_connection";
  pref_antilagConnection = "antilag_current_connection_ping";

  usingGlasses: boolean;
  testsBeforeFailing: number;
  maxToStore: number;
  testsToStartWith: number;
  cacheMinuteExpires: number;
  useAntilagCache: boolean;
  warnCantFind: boolean;
  lastLogin: number = 0;
  currentSessionLag: number;
  resetConnectionStats: boolean;

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
    this.usingGlasses = getProp(this.pref_useElvishGlasses, false);
    this.useAntilagCache = getProp(this.pref_antilagCache, false);
    this.resetConnectionStats = getProp(this.pref_differentConnection, false);
  }

  getCurrentLag() {
    const started = Date.now();

    for (let i = 0; i < 5; i++) {
      visitUrl("api.php?what=events&for=Antilag_by_Irrat");
    }

    return Date.now() - started;
  }

  getLastTests(): number[] {
    return getProperty(this.pref_lastLagTests)
      .split(",")
      .filter((s) => s.length > 0)
      .map((s) => toInt(s));
  }

  saveLastTests(test: number[]) {
    setProperty(this.pref_lastLagTests, test.join(","));
  }

  relog() {
    // Always reset the current session lag
    this.currentSessionLag = null;

    const item = Item.get("Elvish sunglasses");

    if (
      this.usingGlasses &&
      availableAmount(item) > 0 &&
      equippedAmount(item) == 0
    ) {
      equip(item);
    }

    if (getRevision() >= 27452) {
      this.doNewRelog();
    } else {
      this.doOldRelog();
    }
  }

  doNewRelog() {
    const prop = getProperty("pingLoginCheck");

    if (prop.length > 0 && prop != "none") {
      setProperty("pingLoginCheck", "none");
    }

    try {
      cliExecute("relog");
    } finally {
      if (prop.length > 0 && prop != "none") {
        setProperty("pingLoginCheck", prop);
      }
    }
  }

  doOldRelog() {
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

        if (i++ > 0 || Date.now() - this.lastLogin < 31_000) {
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

  needsToCheckCurrentLag() {
    const setting = getProperty(this.pref_lastLagTested).split("|");

    if (setting.length != 2) {
      return true;
    }

    if (setting[0] != myHash()) {
      return true;
    }

    // So we know its always this current session
    // If we're not using the cache, then we always return what the current script runtime was
    if (!this.useAntilagCache) {
      return this.currentSessionLag == null;
    }

    const diff = Date.now() - toInt(setting[1]);
    const expiresAfter = 1000 * 60 * this.cacheMinuteExpires;

    if (diff > expiresAfter) {
      return true;
    }

    if (this.currentSessionLag == null) {
      this.currentSessionLag = toInt(getProperty(this.pref_thisSessionLag));
    }

    return false;
  }

  getConnectionPing(expected: number): number {
    let lowestPing = 999_999;
    let attempts = expected == null ? 5 : 3;

    for (let i = 0; i < attempts; i++) {
      const started = Date.now();
      visitUrl("https://www.kingdomofloathing.com/");
      lowestPing = Math.min(Date.now() - started, lowestPing);

      if (
        expected != null &&
        this.isDifferentConnection(lowestPing, expected) &&
        attempts < 5
      ) {
        attempts = 5;
      }
    }

    return lowestPing;
  }

  isDifferentConnection(expected: number, now: number): boolean {
    const perc = Math.min(expected, now) / Math.max(expected, now);

    return perc < 0.8;
  }

  getSessionLag() {
    if (this.needsToCheckCurrentLag()) {
      const current = (this.currentSessionLag = this.getCurrentLag());

      setProperty(this.pref_thisSessionLag, current.toString());
      setProperty(this.pref_lastLagTested, myHash() + "|" + Date.now());

      const tests = [current, ...this.getLastTests()];

      if (tests.length > this.maxToStore) {
        tests.pop();
      }

      this.saveLastTests(tests);
    }

    return this.currentSessionLag;
  }

  getBestLatency() {
    const lastTests = this.getLastTests();

    return lastTests.reduce((l, r) => Math.min(l, r), 10_000);
  }

  getIdealLatency() {
    return Math.ceil(this.getBestLatency() * 1.1);
  }

  isGoodSession() {
    const current = this.getSessionLag();

    return this.getIdealLatency() > current;
  }

  checkResetStats() {
    if (!this.resetConnectionStats) {
      return;
    }

    const expectedConnection = getProperty(this.pref_antilagConnection).match(
      /^\d+$/
    )
      ? toInt(getProperty(this.pref_antilagConnection))
      : null;
    const newConnection = this.getConnectionPing(expectedConnection);

    if (
      expectedConnection != null &&
      this.isDifferentConnection(newConnection, expectedConnection)
    ) {
      print("Different connection detected! Resetting antilag cache");
      setProperty(this.pref_antilagCache, "");
      setProperty(this.pref_lastLagTested, "");
      setProperty(this.pref_thisSessionLag, "");

      this.updateNumbers();
    }

    setProperty(this.pref_antilagConnection, newConnection.toString());
  }

  ensureLowLag() {
    this.checkResetStats();

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
        this.getSessionLag() <= this.getIdealLatency() ? "reached" : "failed"
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
