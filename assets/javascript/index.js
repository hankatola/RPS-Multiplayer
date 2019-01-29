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

    var player = {
        name: '',
        wins: '',
        lost: '',
    }

    function commentCard(i) {
        // makes comments in the comment section
        // TODO: fix username, time, and comment text
        let user = $('<strong>').text('Ricky Bobby' + i)
        user.addClass('text-gray-dark')
        let time = $('<span>').text('yesterday')
        let text = $('<span>').text('Shake & Bake!')
        let a = $('<div>').addClass('d-flex justify-content-between align-items-center w-100')
        let b = $('<div>').addClass('media-body pb-3 mb-0 small lh-125 border-bottom border-gray')
        let c = $('<div>').addClass('media text-muted pt-3')
        a.append(user)
        a.append(time)
        a.appendTo(b)
        b.append(text)
        b.appendTo(c)
        console.log(c)
        return c
    }

    function rps(α,β) {

    }

    // commentCard test
    $('#chat-window').empty()
    for (let i = 0; i < 20; i++) {
        $('#chat-window').append(commentCard(i))
    }
})