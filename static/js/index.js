var socket = io()

// 클라이언트가 연결했을 때, 발생하는 이벤트(기본 이벤트 connect)
socket.on('connect', function() {

    // 이름을 입력받기
    var name = prompt('반갑습니다!', '')

    // 이름이 빈칸인 경우 (반복문을 통해 이름을 반드시 입력하기)
    while (!name) {
        var name = prompt('이름을 작성해주세요!', '')
    }

    // 'newUser'라는 이벤트 전송(on이 있어야 수신 가능)
    // 서버에 새로운 유저가 접속했다고 알리는 이벤트 newUser
    socket.emit('newUser', name)
})

/* 자동 스크롤 기능 */
function scrollToBottom() {
    var chatContainer = document.getElementById('chat');
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

// 서버로부터 클라이언트가 데이터를 받았을 때, 발생하는 update 이벤트
socket.on('update', function(data) {
    var chat = document.getElementById('chat')

    var message = document.createElement('div')
    var node = document.createTextNode(`${data.name}: ${data.message}`)
    var className = ''

    // 데이터 타입에 따라 다른 클래스 할당
    switch(data.type) {
        case 'message':
            className = 'other'
            break

        case 'connect':
            className = 'connect'
            break

        case 'disconnect':
            className = 'disconnect'
            break
    }

    message.classList.add(className)
    message.appendChild(node)
    chat.appendChild(message)

    scrollToBottom(); // 자동 스크롤 함수 호출
})

// 메시지 전송 함수
function sendMessage() {
    // 입력된 데이터를 가져옴(무슨 내용을 전송했는지 message에 담음)
    var message = document.getElementById('test').value

    // message 데이터 값을 저장했으니 전송을 보낼 데이터는 빈칸으로 변경
    document.getElementById('test').value = ''

    // 다른 클라이언트(접속자)에게 내 메시지 표시
    var chat = document.getElementById('chat')
    var msg = document.createElement('div')
    var node = document.createTextNode(`나: ${message}`)
    msg.classList.add('me')
    msg.appendChild(node)
    chat.appendChild(msg)

    scrollToBottom(); // 자동 스크롤 함수 호출

    // message 이벤트를 통해 데이터를 서버에 전달
    socket.emit('message', {type: 'message', message: message})
}

// 전송 버튼 누르기 귀찮아서 'Enter' 키 이벤트
document.addEventListener("keyup", function(event) {
    if (event.key === 'Enter') {
        sendMessage()
    }
})