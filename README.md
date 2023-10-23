# 312project [Team: 404 Not Found]

## Pages/Paths:
*/*: **http://localhost:8080/**

*Login*: **http://localhost:8080/login**

*Register*: **http://localhost:8080/register**

*Dashboard*: **http://localhost:8080/dashboard**

***
Sometime page will not be load corretlly if you laptop or pc is slow or having too many tasks on, please give it a few seconds to load
***

You will see two buttons `Login` and `Register` in */* page, each button will navigate you to direct page

If you are navigating to *Dashboard* page without logging in you will see a welcome message, two buttons `Login` and `Register`, and a message telling you welcome to log in or register, you can also see posts if other users posted. But you are not able to **like** any posts.

If you are navigated to *Dashboard* page after/with logging in you will see a welcome message with your username in it, and a form with two input fields title and description and a button `Submit` to submit the post. And posts if other users posted. You are able to **like** the posts.

After registering in *Register* page you will be navigating to *Login* page automaticlly
 - to register please fill in username, email, password, and confirm password
 - if you entered a registered username or email the registeration will be fail

After logging in in *Login* page you will be navigating to *Dashboard* page automaticlly
 - to login please fill in username, password
 - if you entered a unmatch username and password login will fail
 - if you entered a unregistered username login will fail and navigate to *Register* page automaticlly

## Testing:

To start run following command in terminal

```bash
docker compose up
```

### Lo 1:

To login or register
 - press login or register button after navigating to http://localhost:8080/
   
To verify if log in or username displaying
 - nagivate to http://localhost:8080/dashboard

### Lo 2:

To submit a post
 - you need to log in first in order to able to submit forms
 - after loggin in fill in the title and description input field to submit forms
 - after submitting a post, you will see a post popping up with your username, title, description that you filled in, a heart shape button to like or dislike the post, and like counts

To like a post
 - hit the gray heart shape button to like a post
 - once you like the post, the heart shape button will turn from gray shape to a filled heart of red color
 - you are not able to like a post twice, because one you like the post next time you hit the heart button is to dislike the post
 - like counts are show below the heart shape buttoms, will increase one after you like the post

### Lo 3:

To dislike a post
 - if you liked the post you will see a filled heart shape button, and you can hit the heart to dislike. Once you disliked any posts the filled heart of red color will turn to gray heart shape button
 - like count will decrease one after you dislike the post

