const express = require('express')
const socket = require('socket.io')
const http = require('http')
const fs = require('fs')

const app = express()
const server = http.createServer(app)
const io = socket(server)

// 정적파일(프론트)을 위한 미들웨어
// app.use()를 사용하여 원하는 미들웨어를 추가하여 조합 가능
app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))

// GET방식으로 웹서버에 요청
// fs모듈은 파일 관련을 처리
app.get('/', function(req, res) {
  fs.readFile('./static/index.html', function(err, data) {
    if (err) {
      res.send('error')
    } else {
      res.writeHead(200, {'Content-Type':'text/html'})
      res.write(data)
      res.end()
    }
  })
})


// io.sockets은 접속되는 모든 소켓들을 의미
// function(socket)은 접속을 한 해당 socket을 의미
// connection, disconnect 등은 기본 이벤트
// message는 직접 만든 이벤트인데, on(수신)과 emit(전송)이 있어야 이벤트가 발생
io.sockets.on('connection', function(socket) {

  // newUser라는 커스텀이벤트. 누군가 새로 채팅방에 연결했을 때, 발생하는 이벤트
  socket.on('newUser', function(name) {
    console.log(name + '님이 접속하였습니다.')

    socket.name = name

    // 모든 소켓(sockets)에 update라는 이벤트를 통해 누군가 들어왔다고 전송
    // update는 직접 만든 이벤트
    io.sockets.emit("update", {type: 'connect', name: 'SERVER', message: name + '님이 접속하였습니다.'})
  })

  // 전송한 메시지 받기
  socket.on('message', function(data) {
    // 받은 데이터에 누가 메시지를 전송했는지 이름 추가
    data.name = socket.name

    console.log(data)

    // 보낸 사람을 제외한 나머지 유저(broadcast)에게 메시지 전송
    socket.broadcast.emit('update', data)
  })

  
  socket.on('disconnect', function() {
    console.log(socket.name + '님이 퇴장했습니다.')

    // 나가는 사람을 제외한 유저에게 메시지 전송
    socket.broadcast.emit('update', {type: 'disconnect', name: 'SERVER', message: socket.name + '님이 퇴장했습니다.'})
  })
})

// 원하는 포트 번호를 숫자 자리에 넣기
server.listen(9922, function() {
  console.log('server on')
})