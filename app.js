// 모듈 선언
const express = require('express')
const socket = require('socket.io')
const http = require('http')
const fs = require('fs')

// 모듈 바탕으로 변수 선언
const app = express()
const server = http.createServer(app)
const io = socket(server)

// 정적파일(프론트)을 위한 미들웨어
// app.use()를 사용하여 원하는 미들웨어를 추가하여 조합 가능
app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))
app.use('/images', express.static('./static/images'))

// 사용자 관리를 위한 객체 생성
let users = {}

// GET방식으로 웹서버에 요청
// fs모듈은 파일 처리
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

// 배경 이미지 불러오기
app.get('/images', function(request, response){
  fs.readFile('./static/images/ui_with_logo.png', function(err, data){
    if(err) {
      response.send('에러')
    } else {
      response.writeHead(200, {'Content-Type':'text/html'})
      response.write(data)
      response.end()
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

    // 사용자 이름 대신 사용자 정보를 저장하는 객체를 사용
    users[socket.id] = { name: name, score: 0 }

    // 모든 소켓(sockets)에 update라는 이벤트를 통해 누군가 들어왔다고 전송
    // 직접 만든 이벤트 'update'
    io.sockets.emit("update", {type: 'connect', name: 'SERVER', message: name + '님이 접속하였습니다.'})
    
    // 사용자 목록 업데이트 이벤트 전송
    io.sockets.emit('updateUsers', users)
  })

  // 전송한 메시지 받기(직접 만든 이벤트 'message')
  socket.on('message', function(data) {
    // 받은 데이터에 누가 메시지를 전송했는지 이름 추가
    data.name = users[socket.id].name

    console.log(data)

    // 보낸 사람을 제외한 나머지 유저(broadcast)에게 메시지 전송
    socket.broadcast.emit('update', data)
  })

   // 점수 증가 이벤트
   socket.on('increaseScore', function(id) {
    if (users[id]) {
      users[id].score += 1
      io.sockets.emit('updateUsers', users)
    }
  })

  // 점수 감소 이벤트
  socket.on('decreaseScore', function(id) {
    if (users[id] && users[id].score > 0) {
      users[id].score -= 1
      io.sockets.emit('updateUsers', users)
    }
  })

  // 접속 종료(기본적으로 제공하는 이벤트 'disconnect')
  socket.on('disconnect', function() {

    if(!users[socket.id]) {
      return
    }
    console.log(users[socket[id].name] + '님이 나갔습니다.')

    // 나가는 사람을 제외한 유저에게 메시지 전송
    socket.broadcast.emit('update', {type: 'disconnect', name: 'SERVER', message: users[socket.id] + '님이 나갔습니다.'})

    // 해당 사용자 정보 삭제
    delete users[socket.id]

    // 사용자 목록 업데이트 이벤트 전송
    io.sockets.emit('updateUsers', users)
  })
})

// 원하는 포트 번호를 숫자 자리에 넣기
server.listen(9922, function() {
  console.log('server on')
})

/* 점수 처리, 사진 업로드 기능 */
io.sockets.on('connection', function(socket) {
  // newUser, message, disconnect 이벤트 처리 로직은 그대로 유지합니다.

  // // 초기 점수 설정
  // var score = 0;

  // // 점수 증가 요청 처리
  // socket.on('incrementScore', function(id) {
  //   if (users[id]) {
  //     users[id].score += 1
  //     io.sockets.emit('updateUsers', users)
  //   }

  //   // // 변경된 점수를 모든 클라이언트에게 전송
  //   // io.sockets.emit('update', { type: 'score', score: score });
  // });

  // // 점수 감소 요청 처리
  // socket.on('decrementScore', function() {

  //   if (users[id] && users[id].score > 0) {
  //     users[id].score -= 1
  //     io.sockets.emit('updateUsers', users)
  //   }
  //   // // 현재 버튼 점수 감소 로직
  //   // score--;

  //   // // 변경된 점수를 모든 클라이언트에게 전송
  //   // io.sockets.emit('update', { type: 'score', score: score });
  // });

  // 사진 업로드 처리
  socket.on('uploadImage', function(data) {
    // data.imageURL을 적절히 처리하여 저장하거나 다른 클라이언트에게 전달합니다.
    // 예를 들어, 이미지를 서버에 저장하고 해당 이미지의 URL을 다른 클라이언트에게 전달할 수 있습니다.
  
    var imageURL = data.imageURL; // 업로드된 이미지의 URL
    // 변경된 이미지 정보를 모든 클라이언트에게 전송
    io.sockets.emit('update', { type: 'image', imageURL: imageURL });
  });
  
});