var socket = io()

// 접속이 되었을 때, 실행
socket.on('connect', function() {
    var input = document.getElementById('test')
    input.value = '접속 됨'
})

// send 함수
function send() {
    var meesage = document.getElementById('test').value
    document.getElementById('test').value = ''

    /* 'send' 라는 이름의 이벤트를 전송(emit)
        동일한 이벤트명끼리 데이터 송수신이 가능하다. 
        수신은(on) */
    socket.emit('send', {msg: message})
}