var currentUserId='';
var chatKey = '';
var friend_Id = '';
document.addEventListener('keydown',function(key){
    if(key.which == 13){
        sendMessage()
    }
})

function loadChatList(){
    var db = firebase.database().ref('friend_list')
    db.on('value',function(lsts){
        document.getElementById('lstchat').innerHTML=`<li class="list-group-item list-group-item-action" style="background-color: #f8f8f8;">
        <input type="text" placeholder="Search or new chat" class="form-control form-rounded">
    </li>`
        
            lsts.forEach(function(data){
            var lst = data.val()
            var friendKey = '';
            if(lst.userId==currentUserId){
                friendKey = lst.friendId;
            }
            else if(lst.friendId==currentUserId){
                friendKey = lst.userId
            }
            if(friendKey!=""){
                firebase.database().ref('users').child(friendKey).on('value',function(data){
                    var user = data.val()
                    document.getElementById('lstchat').innerHTML+=`<li class="list-group-item list-group-item-action" style="cursor: pointer;" onclick="startChat('${data.key}','${user.name}','${user.photoURL}')">
                    <div class="row">
                        <div class="col-md-2">
                            <img src="${user.photoURL}" class="rounded-circle friend-pic" alt="">
                        </div>
                        <div class="col-md-10">
                            <div class="name d-none d-md-block">${user.name}</div>
                            <div class="under-name d-none d-md-block">This is some text message...</div>
                        </div>
                    </div>
                </li>`
                })
            }
        })
    })
}

/////////
////EMOJI
loadEmojiPanel()
function loadEmojiPanel(){
    var emoji = '';
    for(var i=129315;i<=129327;i++){
        emoji+=`<a href="#" onclick="getEmoji(this)">&#${i};</a>`
    }
    for(var i=128512;i<=128567;i++){
        emoji+=`<a href="#" onclick="getEmoji(this)">&#${i};</a>`
    }
    for(var i=128577;i<=128580;i++){
        emoji+=`<a href="#" onclick="getEmoji(this)">&#${i};</a>`
    }
    emoji+=`<a href="#" onclick="getEmoji(this)">&#129488;</a>`
    for(var i=129296;i<=129314;i++){
        emoji+=`<a href="#" onclick="getEmoji(this)">&#${i};</a>`
    }
    document.getElementById('home').innerHTML=emoji
}
var show = false;
function showEmojiPanl(){
    document.getElementById('emoji').removeAttribute('style')
    if(show==true){
        hideEmojiPanel();
        show = false;
    }else{
        show =true; 
    } 
}
function hideEmojiPanel(){
    document.getElementById('emoji').setAttribute('style','display:none;')
    
}
function getEmoji(control){
    document.getElementById('txtmessage').value+=control.innerHTML;
}

/////////

function startChat(friendKey,friendname,friendPhoto){
    var friendList = {friendId:friendKey,userId:currentUserId}
    friend_Id = friendKey;
    var db = firebase.database().ref('friend_list');
    var flag = false;
    db.on('value',function(friends){
        friends.forEach(function(data){
            var user = data.val()
            if((user.friendId==friendList.friendId && user.userId==friendList.userId) || (user.friendId==friendList.userId && user.userId==friendList.friendId)){
                flag = true;
                chatKey = data.key;
            }
        })
        if(flag==false){
            chatKey = firebase.database().ref('friend_list').push(friendList,function(error){
                if(error){
                    alert(error)
                }else{
                    document.getElementById('chatPanel').removeAttribute('style')
                    document.getElementById('divStart').setAttribute('style','display:none')
                }
            }).getKey()
        }else{
            document.getElementById('chatPanel').removeAttribute('style')
            document.getElementById('divStart').setAttribute('style','display:none')
        }
        document.getElementById('divChatName').innerHTML=friendname
        document.getElementById('chatImage').src=friendPhoto
        document.getElementById('message').innerHTML = '';

        document.getElementById('txtmessage').value=''
        document.getElementById('txtmessage').focus()

        loadChatMessages(chatKey,friendPhoto);
    })
    
    

    

    
    // hideChatList();
}

function loadChatMessages(chatKey,friendPhoto){
    var db = firebase.database().ref('chatMessages').child(chatKey);
    db.on('value',function(chats){
        var messageDisplay=''
        chats.forEach(function(data){
            var chat = data.val();
            var dateTime = chat.time.split(",");
            var msg = '';
            if(chat.message.indexOf("base64")!=-1){
                msg = `<img src="${chat.message}" class="img-fluid" />`
            }else{
                msg = chat.message;
            }
            if(chat.userId!=currentUserId){
                messageDisplay+=`<div class="row">
                <div class="col-2 col-sm-1 col-md-1">
                    <img src="${friendPhoto}" class="rounded-circle chat-pic" alt="">
                </div>
                <div class="col-6 col-sm-6 col-md-6">
                    <p class="recieve">${msg}
                        <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}</span>
                    </p>
                </div>
            </div>`
            }else{
                messageDisplay+= `<div class="row justify-content-end">
                <div class="col-6 col-sm-6 col-md-6">
                    <p class="sent float-right">${msg}
                        <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}</span>
                    </p>
                </div>
                <div class="col-2 col-sm-1 col-md-1">
                    <img src="${firebase.auth().currentUser.photoURL}" class="rounded-circle chat-pic" alt="">
                </div>
            </div>`
            }
            
        })
        document.getElementById('message').innerHTML=messageDisplay
        document.getElementById('message').scrollTo(0,document.getElementById('message').scrollHeight)
    })
}

function showChatList(){
    document.getElementById('side-1').classList.remove('d-none','d-md-block')
    document.getElementById('side-2').classList.add('d-none')
}

function hideChatList(){
    document.getElementById('side-1').classList.add('d-none','d-md-block')
    document.getElementById('side-2').classList.remove('d-none')
}


function sendMessage(){
    var emp = document.getElementById('txtmessage').value;
    if(emp!=""){
        var chatMessage = {
        userId:currentUserId,
        message:document.getElementById('txtmessage').value,
        time: new Date().toLocaleString() }
    
        firebase.database().ref('chatMessages').child(chatKey).push(chatMessage,function(error){
            if(error){
                alert(error)
            }else{
                
            firebase.database().ref('fcmTokens').child(friend_Id).once('value',function(data){
                $.ajax({
                    url : 'https://fcm.googleapis.com/fcm/send',
                    method : 'POST',
                    headers: {
                        'Content-Type':'application/json',
                        'Authorization':'key='+'AAAA6FwZVzY:APA91bGvY_sY8g4yEYe1QgyKIWSBqyWSs-rDV9gUlJLWPs2FgaQ4f_fLM9lI4KI99HbBbCPDG6fdJJafsIG1TV3MrlqTvKsSbvo07lAfW_MH-9R42DQfkp_WZDCadBPfA1edEyVgTrzw'
                    },
                    data : JSON.stringify({
                        'to' : data.val().token_id,
                        'data':{'name':firebase.auth().currentUser.displayName,'message':chatMessage.message.substring(0,30)+'...','icon':firebase
                    .auth().currentUser.photoURL}
                    }),
                    success : function(response){
                        console.log(response);
                    },
                    error : function(xhr,status,error){
                        console.log(xhr.error)
                    }
                })
            })

            document.getElementById('txtmessage').value=''
            document.getElementById('txtmessage').focus()
            }
        })
    }else{
        document.getElementById('txtmessage').value=''
        document.getElementById('txtmessage').focus()
    }

}
//Image sent//
function chooseImage(){
    document.getElementById('imageFile').click()
}
function sendImage(event){
    var file = event.files[0]

    if(!file.type.match("image.*")){
        alert("Please choose only image");
    }else{
        var reader = new FileReader();
        reader.addEventListener('load',function(){
            var chatMessage = {
                userId:currentUserId,
                message:reader.result,
                time: new Date().toLocaleString() }
            
                firebase.database().ref('chatMessages').child(chatKey).push(chatMessage,function(error){
                    if(error){
                        alert(error)
                    }else{
                    document.getElementById('txtmessage').value=''
                    document.getElementById('txtmessage').focus()
                    }
                })
        },false)
        if(file){
            reader.readAsDataURL(file);
        }
    }
}
//////
function populateFriendList(){
    document.getElementById('lstFriend').innerHTML=`<div class="spinner-border text-center">
                                                        <span class="spinner-border  role="status" text-primary mt-5"style="width:7rem;height:7rem;"></span>
                                                    </div>`
    var db = firebase.database().ref(`users`)
    var lst = '';
        db.on('value',function(users){
            if(users.hasChildren()){
                lst = `<li class="list-group-item list-group-item-action" style="background-color: #f8f8f8;">
                <input type="text" placeholder="Search or new chat" class="form-control form-rounded">
            </li>`
            }
            users.forEach(function(data){
                var user = data.val();
                if(user.email!=firebase.auth().currentUser.email){ 
                lst+=`<li class="list-group-item list-group-item-action" style="cursor: pointer;" data-dismiss="modal" onclick="startChat('${data.key}','${user.name}','${user.photoURL}')">
                <div class="row">
                    <div class="col-md-2">
                        <img src="${user.photoURL}" class="rounded-circle friend-pic" alt="">
                    </div>
                    <div class="col-md-10">
                        <div class="name d-none d-md-block">${user.name}</div>
                    </div>
                </div>
                </li>`
                }
                
            })
            document.getElementById('lstFriend').innerHTML=lst

        })
}


///////////////////////////

function signIn(){
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
    
}

function signOut(){
    document.getElementById('lstchat').setAttribute('style','display:none')
    document.getElementById('chatPanel').setAttribute('style','display:none')
    document.getElementById('divStart').removeAttribute('style','display:none')
    firebase.auth().signOut()
}


function onFirebaseStateChanged(){
    firebase.auth().onAuthStateChanged(onStateChanged);
}

function onStateChanged(user){
    if(user){
        // alert(firebase.auth().currentUser.email+'\n'+firebase.auth().currentUser.displayName)

        var userProfile={email:'',name:'',photoURL:''}
        userProfile.email = firebase.auth().currentUser.email
        userProfile.name = firebase.auth().currentUser.displayName
        userProfile.photoURL = firebase.auth().currentUser.photoURL

        var db = firebase.database().ref(`users`)
        var flag = false
        db.on('value',function(users){
            users.forEach(function(data){
                var user = data.val();
                if(user.email == userProfile.email){ 
                    currentUserId=data.key
                    flag=true;
                }
            })
            if(flag==false){
                firebase.database().ref(`users`).push(userProfile,callback)      
            }else{
            document.getElementById('imgProfile').src=firebase.auth().currentUser.photoURL
            document.getElementById('imgProfile').title=firebase.auth().currentUser.displayName
            document.getElementById('lnkSignIn').style='display:none;';
            document.getElementById('lnkSignOut').style='';
            }

            const messaging = firebase.messaging();


            // Request permission and get token.....
            messaging.requestPermission().then(function () {
                // console.log(messaging.getToken());
                return messaging.getToken();
            }).then(function (token) {
                firebase.database().ref('fcmTokens').child(currentUserId).set({ token_id: token });
            })


            document.getElementById('lnkNewChat').style='display:block;';
            loadChatList();
        })
        
        document.getElementById('lstchat').removeAttribute('style','display:none')
        
    }else{
        document.getElementById('imgProfile').src="img/account.png";
        document.getElementById('imgProfile').title="";
        document.getElementById('lnkSignIn').style='';
        document.getElementById('lnkSignOut').style='display:none;';
        document.getElementById('lnkNewChat').style='display:none;';
    }
}

function callback(error){
    if(error){
        alert(error)
    }else{
        document.getElementById('imgProfile').src=firebase.auth().currentUser.photoURL
        document.getElementById('imgProfile').title=firebase.auth().currentUser.displayName
        document.getElementById('lnkSignIn').style='display:none;';
        document.getElementById('lnkSignOut').style='';
    }
}

onFirebaseStateChanged();