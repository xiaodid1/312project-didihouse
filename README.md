# 312project [Team: 404 Not Found]

Deployed Url: **http://auction404notfound.com** or **https://auction404notfound.com**


## Pages/Paths:

*/*: **http://auction404notfound/**

*Login*: **http://auction404notfound/login**

*Register*: **http://auction404notfound/register**

*Auction board*: **http://auction404notfound/auction-board**

*Profile*: **http://auction404notfound/profile**

*Create Auction*:  **http://auction404notfound/auctions**

*Auction Room*: **http://auction404notfound/auction-room*

***
Sometime page will not be load corretlly if your laptop or pc is slow or having too many tasks on, please give it a few seconds to load
***

## All pages are deployed websocket, any auction changes will show in real time


You will see two buttons `Login` and `Register` in */* page, each button will navigate you to direct page

Nagivating to any of the above page (other than login and register) with out logging in will be redirected to login page

**Create Auction**: 
 - Feature for image upload if other type of file uploaded still able to create auction but not showing item image
 - Bid are only allow number with 2 decimals , max 10000 min 1
 - Duration time are only allow integers , max 360 min 1 (in seconds)

**Auction Room**
 - Owner not allow to place bid
 - Only allow to place bit when auction is ongoing and bid is highest than previous bit , max 100000 , only allow 2 decimals
