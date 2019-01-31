$(document).ready(function(){
    /*
        Initialize Firebase
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

    var opponent, player = {
        name: '',
        wins: 0,
        lost: 0,
        id: Math.floor(Math.random()*Math.pow(10,16)),
    }




    /*
        Function Farm
    */

    // makes comments in the comment section
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

    function findOpponent(x) {
        if (player.opponentID === 0) {
            for (let i in x.val()) {
                let y = x.val()[i]
            }
        }
    }


    /*
        Event Listeners
    */

    // login page listener
    $(document).on('click','#user-name-button',function(ε) {
        ε.preventDefault()
        player.name = $('#user-name').val().trim()
        $('#modal-message').text('Welcome ' + player.name + '!')
        $('#welcome-modal').modal('toggle')
        $('#sign-in').hide()
        db.ref('users').child(player.id).child('name').set(player.name)
        db.ref('users').child(player.id).child('opponentID').set(false)

    })

    // listener for connection state
    connected.on('value',function(α) {
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
    })

    // chat button listener
    $(document).on('click','#message-button',function(ε) {
        ε.preventDefault()
        let message = $('#message').val().trim()
        db.ref('chat').push({
            name: player.name,
            message: message,
            time: firebase.database.ServerValue.TIMESTAMP,
        })
        $('#message').val('')
    })

    // chat database update listener
    db.ref('chat').on('child_added',function(ε) {
        let name = ε.val().name
        let message = ε.val().message
        let time = ε.val().time
        time = moment(time).format('MMM D, YYYY h:mm a')
        commentCard(name,message,time)
        let cw = $('#chat-window')
        var height = cw[0].scrollHeight;
        cw.scrollTop(height);

    })
})