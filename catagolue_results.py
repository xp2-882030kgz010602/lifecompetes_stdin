import urllib2
import hashlib
import sys
#The key is taken in via command line arguments
key=sys.argv[1]
serveraddress="https://catagolue.hatsya.com"
payload="payosha256:get_token:"+key+":post_apgsearch_haul"
#Okay, let's engage with Catagolue's payosha256 system
req=urllib2.Request(serveraddress+"/payosha256",payload,{"Content-type":"text/plain"})
try:
  f=urllib2.urlopen(req)
except:#Catagolue is unavailable
  print("Unsuccessful")
  exit()
if f.getcode()!=200:#Catagolue is probably also unavailable
  print("Unsuccessful")
  exit()
try:
  resp=f.read()
  lines=resp.splitlines()
  parts=lines[1].split(":")
except:#Oh no, something's wrong with the payosha256 output
  print("Unsuccessful")
  exit()
if len(parts)!=4:
  print("Unsuccessful")
  exit()
if parts[1]!="good":
  print("Unsuccessful")
  exit()
target=parts[2]
token=parts[3]
print("Token "+token+" obtained from payosha256. Performing proof of work with target "+target+"...")
for nonce in xrange(100000000):#How do I do this efficiently?
  prehash=token+":"+str(nonce)
  posthash=hashlib.sha256(prehash).hexdigest()
  if posthash<target:
    break
if posthash>=target:#Well, that didn't work.
  print("Unsuccessful")
  exit()
print("String "+prehash+" is sufficiently valuable ("+posthash+"<"+target+").")
payload="payosha256:pay_token:"+prehash+"\n"
#Ok, let's send the results to Catagolue.
results=""
for line in sys.stdin:
  results+=line
payload+=results
req=urllib2.Request(serveraddress+"/apgsearch",payload,{"Content-type":"text/plain"})#We won't be verifying any hauls because infinite grids are difficult.
try:
  f=urllib2.urlopen(req)
except:#Catagolue went down while we were inefficiently cracking hashes
  print("Unsuccessful")
  exit()
if f.getcode()!=200:#Same here
  print(str(f.getcode()))
  print("Unsuccessful")
  exit()
resp=f.read()
print(str(resp))
if resp!="Payosha256 authentication succeeded.\n***********************************************\n":#Any other response means something's probably wrong
  print("Unsuccessful")
