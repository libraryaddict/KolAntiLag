This script logs you in and out of kol on kolmafia to try keep you on a lag free server.

Because I'm lazy, this script **requires Parka**.

To see the settings, use `prefref antilag_`

You can configure how many latencies to cache, what to fail on, if the fail should throw an abort, etc.

Each relog takes about 30 seconds at least, and the first time you run this will require 5 relogs to make sure the dataset is filled in.
Default cache is 15min to see if you're on the best server or not. So if you run this every 5min, it'll only start switching servers every 15min.

```
git checkout libraryaddict/KolAntiLag release
```
