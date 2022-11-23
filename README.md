# more.tf
 Website project for the game Team Fortress 2 and made using MERN stack. It makes connections between two commonly used websites as well as finding unprocessed player  information.
 
 This website gathers information that is sourced by 3 external calls;
  - logs.tf data api, this call is sent to "logs .tf/api/v1/log/log-id-here" with the log id given by player.
  - demos.tf search api, after the logs.tf response the data is used to find the demos.tf demo id.
  - logs.tf raw log file, zip file provided by a link for the raw log text file.
  
 Backend processes all of the responses, running through about 10,000 to 50,000 lines of text as well as 2 JSON responses that gets parsed to a single JSON return for the frontend.
 
 Welcome page of more.tf,
 ![image](https://user-images.githubusercontent.com/104592697/203655889-a007299c-0e9a-4064-af04-c7a2085f6064.png)

 Some of the information normally not available made possible with this application;
  
  Damage spread of any player compared to classes
  ![image](https://user-images.githubusercontent.com/104592697/203656208-d5022e74-b7a7-44f4-810f-859b7de12411.png)

  Kill map for the players kills, positions of the killer and the victim<br />
  ![image](https://user-images.githubusercontent.com/104592697/203656337-4eab8fd3-c111-4888-bd29-149249da88a5.png)

  Making both logs.tf and demos.tf links available without needing to search for each link separetly
  ![image](https://user-images.githubusercontent.com/104592697/203656472-6b676f85-80ac-4889-9398-4ef30c816b5b.png)
