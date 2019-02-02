$(document).ready(function(){



    /*
        Initialize Firebase
        ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
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










    /*
        Global Variables
        ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
    */

    var opponent, player = {
        name: '',
        wins: 0,
        lost: 0,
        id: Math.floor(Math.random()*Math.pow(10,16)),
    }









    /*
        Function Farm
        ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
    */

    //
    //    Login functions
    //

    // (1) adds user record to 'connections' & 'users' branches
    function recordOnline(α) {
        // add record that this user is online
        if (α.val()) {
            let id = player.id
            let c = active.push(id)
            
            c.onDisconnect().remove()
            db.ref('users').child(id).set({
                name: player.name,
                won: 0,
                lost: 0,
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
        db.ref('users').child(player.id).child('opponentID').set(false)

    }


    //
    //  Chat functions
    //

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









    /*
        Event Listeners
        ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
    */

    // login page listener
    $(document).on('click','#user-name-button',login)

    // listener for connection state
    connected.on('value',recordOnline)

    // chat button listener
    $(document).on('click','#message-button',sendChatMessage)

    // chat database update listener
    db.ref('chat').on('child_added',displayChatMessage)
})