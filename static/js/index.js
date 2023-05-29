var socket = io()

socket.on('connect', function() {

    // 이름을 입력받기
    var name = prompt('반갑습니다!', '')

    // 이름이 빈칸인 경우 (반복문을 통해 이름을 반드시 입력하도록 유도)
    while (!name) {
        var name = prompt('이름을 작성해주세요!', '')
    }

    // 'newUser'라는 이벤트 전송(on이 있어야 수신 가능)
    socket.emit('newUser', name)
})

socket.on('update', function(data) {
    console.log(`${data.name}: ${data.message}`)
})

// 전송 함수
function sendMessage() {
    // 입력된 데이터를 가져옴(무슨 내용을 전송했는지 message에 담음)
    var message = document.getElementById('test').value

    // message 데이터 값을 저장했으니 전송을 보낼 데이터는 빈칸으로 변경
    document.getElementById('test').value = ''

    // message 이벤트를 통해 데이터를 서버에 전달
    socket.emit('message', {type: 'message', message: message})
}