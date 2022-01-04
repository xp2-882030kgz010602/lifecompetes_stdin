You need Node.js and Python 2.7.13. Python is used only to talk to Catagolue.
Usage: node lifecompetes_stdin.js <key> <maxgen>
If #anon doesn't work, try \\\#anon, which on some shells gets parsed to \#anon, so when Python is called, it will receive #anon. #anon will simply get commented out on those shells.
The program will run for <maxgen> generations and check for periodicity. This means that if the board doesn't repeat in <maxgen> generations, it simply gets skipped. 
The latest version of socket.io-client will not work, but 2.0 will:
npm install socket.io-client@2.0
The processor "times out" if the board takes more than 200 generations to repeat, you can change this by editing the "GEN_LIMIT" variable in lcprocessor.js.
