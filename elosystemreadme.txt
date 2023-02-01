This system is only used for 6s and 9s.

Math to score players out of 10.0 points "10.0 being max 0.0 being min" from this percentage there will be MMR drived scores up and down.

Things to consider;

    Match AVG elo:
        ** This data can be used to display "highest rating match played today" **
        - Assuming RGL average elo's per division and counting that elo in to the average math if the player has currently no elo.
        - If there is no RGL team/profile, the players elo is assumed on average of the other for the given match.

    Team AVG elo:
        - This is used to judge the matchup on front end as well as potential elo-loss reductions.
        - When a main team plays against a Invite team the invite team has more to lose than to gain.

    Player Elo Differential:
        - Disparity of the players elo to the match average, if player performed significantly or even recieved and "MVP" in a high ranked match, they gain more elo.
        - This needs to be very specific to make sure high rank supports are not getting punished for their bad combats.

    Match Score / duration:
        - Quicker games with big score difference will be the max scores gained/lost.
        - Draw would be even while 4-3 match that went on 40 mins might be very close to even.
        - This will be score from -5.0 to 5.0, 0 will be the closest to draw, sum of the both teams would also equal to 0 (team A gains 3.4 while team B loses 3.4).

    Player Performance:
        - Formulas behind each elo to damage/elo graph where putting in the players damage returns a elo equivelant. (doing this perclass per format will take care of class problems)
        - Players will be ranked from the resonable peak performance in terms of per/minute stat to reasonable floor.
            ex. demoman peak for hl is around 800dpm~ while low is 300dpm~ a bell curve graph will determine the elo gained from this stat.
        - Out of the 5-10~ important stats there would be sum made from those numbers to rate individual performance.
        - finding the weight of stat per class is very important having a bell curve per class and division would take care of this.
            (taking account map format "expected more damage on koth then stopwatch" would fine detail this but not necessary)
        - Initial bell curves will be assambled taking account the games played for last 12 months and data from individual player will be collecting if there is a matching rank in rgl for that window.
        
    Elo disparity to the match elo:

