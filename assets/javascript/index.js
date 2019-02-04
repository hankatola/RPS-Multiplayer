$(document).ready(function(){

    /*
        Initialize Firebase & Global Variables
        ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
    */
    var config = {
        apiKey: "AIzaSyBknjX2o3AQCT_E5xADzK9sH7QknFBxKpE",
        authDomain: "homework7-eac85.firebaseapp.com",
        databaseURL: "https://homework7-eac85.firebaseio.com",
        projectId: "homework7-eac85",
        storageBucket: "homework7-eac85.appspot.com",
        messagingSenderId: "187637970919"
    };
    firebase.initializeApp(config);
    var db = firebase.database()
    var active = db.ref("/connections")
    var connected = db.ref(".info/connected")

    //
    //  Global Variables
    //  ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
    var player = {
        name: '',
        wins: 0,
        lost: 0,
        gameid: false,
        id: Math.floor(Math.random()*Math.pow(10,15)),
    }
    var opp = {
        name: '',
        wins: 0,
        lost: 0,
        id: false
    }
    var gameNum





    /*
        Function Farm
        ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
    */

    //
    //  Login functions
    //  ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾

    // (1) adds user record to 'connections' & 'users' branches
    function recordOnline(α) {
        // add record that this user is online
        if (α.val()) {
            let id = player.id
            let c = active.push({
                id:id,
            })
            c.onDisconnect().remove()
            db.ref('users').child(id).set({
                name: player.name,
                available: true,
                won: 0,
                lost: 0,
                gameid: '',
                time: firebase.database.ServerValue.TIMESTAMP
            })
        }
    }

    // (2) login & update user record w/ user name
    function login(ε) {
        ε.preventDefault()
        player.name = $('#user-name').val().trim()
        $('#modal-message').text('Welcome ' + player.name + '!')
        $('#welcome-modal').modal('toggle')
        $('#sign-in').hide()
        db.ref('users').child(player.id).child('name').set(player.name)
    }

    // (3) find opponent
    function findOpponent(ε) {
        let online = [], players = {}
        if (opp.id > 0) {   // exit if we already have an opponent
            return
        }
        for (let i in ε.val()) {
            players[i] = ε.val()[i]
        }
        // get online player list (online)
        db.ref('connections').once('value',function(α){
            for (let i in α.val()) {
                online.push(α.val()[i].id)
            }
        }).then(function(){
            // update display w/ win/lost numbers
            // determine/find opponent
            // If we have an opponent, and they are on the list, return - we con't care
            // we also don't care if there is only one player online
            if ((!opp.id && online.indexOf(opp.id) >= 0) || online.length === 1) {
                return
            } else {
                if (players[player.id].available === false) {
                    // mark yourself available if you're marked as not available
                    db.ref('users').child(player.id).child('available').set(true)
                }
                // find an opponent
                for (let i in online) {
                    // online[i] is an id
                    if (online[i] !== player.id && players[online[i]].available === true) {
                        // this is our new opponent
                        gameNum = 1
                        opp.id = online[i]
                        db.ref('users').child(opp.id).child('available').set(false)
                        let x = Math.min(player.id,opp.id)
                        let y = Math.max(player.id,opp.id)
                        player.gameid = x.toString() + y.toString() + gameNum.toString()
                        db.ref('users').child(player.id).child('gameid').set(player.gameid)
                    }
                }
            }
        })
    }

    //
    //  Chat functions
    //  ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾

    // (1) sends chat message to db & resets field
    function sendChatMessage(ε) {
        ε.preventDefault()
        let message = $('#message').val().trim()
        db.ref('chat').push({
            name: player.name,
            message: message,
            time: firebase.database.ServerValue.TIMESTAMP,
        })
        $('#message').val('')
    }

    // (2) displays chat messages in db
    function displayChatMessage(ε) {
        let name = ε.val().name
        let message = ε.val().message
        let time = ε.val().time
        time = moment(time).format('MMM D, YYYY h:mm a')
        commentCard(name,message,time)
        let cw = $('#chat-window')
        var height = cw[0].scrollHeight;
        cw.scrollTop(height);

    }

    // (3) makes comments in the comment section
    function commentCard(name,message,t) {
        let user = $('<strong>').text(name)
        user.addClass('text-gray-dark')
        let time = $('<span>').text(t)
        let text = $('<span>').text(message)
        let a = $('<div>').addClass('d-flex justify-content-between align-items-center w-100')
        let b = $('<div>').addClass('media-body pb-3 mb-0 small lh-125 border-bottom border-gray')
        let c = $('<div>').addClass('media text-muted pt-3')
        a.append(user)
        a.append(time)
        a.appendTo(b)
        b.append(text)
        b.appendTo(c)
        let cw = $('#chat-window')
        cw.append(c)
    }

    //
    //  Game functions
    //  ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
    function sendRps() {
        let choice = $(this).attr('id')
        db.ref('games').once('value',function(x) {
            try {
                let id = player.id
                let ζ = x.val()[player.gameid].id
                let η = x.val()[player.gameid]
                if (ζ || !η) {
                    // if ζ exists, you've already picked this game
                    // if η doesn't exist, you don't have an opponent
                    // in either case we need to ignore this click
                    return
                }
            } catch {
                /*  nothing - this try{}catch{} section exists as an
                    if there's an error, then abort, else continue
                */
            }
        })
        db.ref('games').child(player.gameid).child(player.id).set(choice)
    }

    function playGame(α) {
        if (!player.gameid) {
            return
        }
        // won/lost function
        function determineWinner(α,β) {
            let result
            if (
                (α === 'rock' && β === 'scissors') ||
                (α === 'scissors' && β === 'paper') ||
                (α === 'paper' && β === 'rock')
            ) {
                result = 1
            } else {
                result = -1
            }
            if (α === β) {
                result = 0
            }
            // if (α === 'rock') {
            //     if (β === 'scissors') {
            //         result = 1
            //     } else {
            //         result = -1
            //     }
            // }
            // if (α === 'scissors') {
            //     if (β === 'paper') {
            //         result = 1
            //     } else {
            //         result = -1
            //     }
            // }
            // if (α === 'paper') {
            //     if (β === 'rock') {
            //         result = 1
            //     } else {
            //         result = -1
            //     }
            // }
            // if (α === β) {
            //     result = 0
            // }
            return result
        }
        let game = α.val()[player.gameid]
        let me = game[player.id]
        let them = game[opp.id]
        let outcome
        if (!me && them) {
            $('#ready-opponent').text('Picked & is waiting for you')
        }
        if (me) {
            $('#ready-player').text('Picked ' + me)
        }
        if (me && them) {
            // game is over, both have chosen, determine winner
            outcome = determineWinner(me,them)
            if (outcome > 0) {
                // victory! - post the victory to chat
                player.wins++
                db.ref('users').child(player.id).child('won').set(player.wins)
                db.ref('chat').push({
                    name: player.name,
                    message: me + ' beats ' + them + ", so I beat " + opp.name + '!',
                    time: firebase.database.ServerValue.TIMESTAMP,
                })
                    }
            if (outcome < 0) {
                // defeat! - the opponent will post to chat
                player.lost++
                db.ref('users').child(player.id).child('lost').set(player.lost)
            }
            if (outcome === 0) {
                // tie! - whoever's id is smaller will post the tie to chat
                if (player.id > opp.id) {
                    db.ref('chat').push({
                        name: player.name,
                        message: opp.name + ' and I both chose ' + me + ' and we tied!',
                        time: firebase.database.ServerValue.TIMESTAMP,
                    })
                }
            }
            gameNum++
            player.gameid = player.gameid.substring(0,30) + gameNum.toString()
        }
    }

    function display(α) {
        let users = {}
        for (let i in α.val()) {
            users[i] = α.val()[i]
        }
        $('#won-player').text('Won: ' + users[player.id].won)
        $('#lost-player').text('Lost: ' + users[player.id].lost)
        $('#name-player').text('You: ' + users[player.id].name)
        if (opp.id) {
            opp.name = users[opp.id].name
            $('#name-opponent').text('Your Opponent: ' + opp.name)
            $('#won-opponent').text('Won: ' + users[opp.id].won)
            $('#lost-opponent').text('Lost: ' + users[opp.id].lost)
        }
    }





    /*
        Event Listeners
        ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
    */

    // login page listener
    $(document).on('click','#user-name-button',login)

    // listener for connection state
    connected.on('value',recordOnline)

    active.on('value',findOpponent)

    // chat button listener
    $(document).on('click','#message-button',sendChatMessage)

    // chat database update listener
    db.ref('chat').on('child_added',displayChatMessage)

    // user update listener - finds opponent
    db.ref('users').on('value',findOpponent)

    // user update listener #2 - display's opponent stats
    db.ref('users').on('value',display)

    // game play - send choice to database
    $(document).on('click','.btn-lg',sendRps)

    // game play - listen for choice from opponent
    db.ref('games').on('value',playGame)
})