import React, { useCallback, useEffect, useReducer, useState } from 'react';
import './App.css';
import { response } from 'express';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

type TodoState = Todo[];

type TodoAction =
  | { type: 'ADD_TODO'; text: string }
  | { type: 'CHECK_TODO'; id: string }
  | { type: 'INIT_TODO'; list: Todo[] };

// interface Menu
// {
//   name : string;
//   price : number;
// }

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'ADD_TODO':
      
      return [...state, { id: Date.now().toString() , text: action.text, completed: false }];
    case 'CHECK_TODO':

      return state.filter(todo => todo.id !== action.id);

    case 'INIT_TODO':

      return action.list
    
    default:
      return state;
  }
};


const App: React.FC = () => {
  const [state, dispatch] = useReducer(todoReducer, []);
  const [text, setText] = useState('');
  const [modifyTodo, setModifyTodo] =useState<Todo | undefined>()

  useEffect(()=>{
    fetch("http://192.168.35.96:1234/mission") //=> 매개변수의 url로 데이터 요청
    .then(response => response.json())
    .then(data =>{
      const Todolist = data.list.map((item : {
        clear : boolean,
        content : string,
        id : string
      }) => {
        return {
          id: item.id,
          text: item.content,
          completed:item.clear
        }
      }) as Todo[]
      
      dispatch({type : "INIT_TODO", list : Todolist})
    })
    .catch(err => {
      console.log(err)
    })
  },[]) // 최초 1회 이후 [] 안에 있는 내용이 변경될때마다 호출

  
  const handleAddTodo = async () => {
    // if (text.trim()) { 
    //   dispatch({ type: 'ADD_TODO', text });
    //   setText('');
    // }
    fetch ("http://192.168.35.96:1234/upload", {
    method:"post",
    headers : {
      "Content-Type" : "application/json"
    },
    body : JSON.stringify({
      content : text
    })
  })
  .then (response => response. json ())
  .then (data => {
    // console. log(data)
    // window. location.reload()
    if(data.message == "성공") {
      dispatch({type: "ADD_TODO",text:text});
    }
     
  })
  .catch(err => {
    console.log(err)
  })
};

const handleModifyTodo = useCallback((item : Todo) => {
  setModifyTodo(item)
},[])

const handleModifyInputChange = (e : React.ChangeEvent) => {
  const ele = e.target as HTMLInputElement
  setModifyTodo({
    ...modifyTodo!,
    text : ele.value
  })
}

const handleModifySubmit =  () =>{
  fetch('http://192.168.35.96:1234/${modifyTodo!.id}',{
    method : "patch",
    headers : {
      "Content-Type" : "application/json"
    }
  })
  .then (res => res. json())
  .then (data => {
    console. log(data)
})
}

  return (
    <div className="app">
      <h1>Todo List</h1>
      <div className="todo-list">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)} 
        />
        <button onClick={handleAddTodo}>Add Todo</button> 
        {
          modifyTodo && (
           <div>
            <hr></hr>
            <input value={modifyTodo.text} onChange={handleModifyInputChange}/>
            <button onClick={handleModifySubmit}>수정하기</button>
           </div>
          )
        }

        <div>
          {state.map((item) => (
            <div key={item.id} className="todo-item">
              <button onClick={()=>handleModifyTodo(item)}>수정</button>
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => dispatch({ type: 'CHECK_TODO', id: item.id })} 
              />
              <span style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>
                {item.text}
              </span>
              <button onClick={() => dispatch({ type: 'CHECK_TODO', id: item.id })}>Delete</button>

            </div>
          ))}
        </div> 
      </div>
    </div>
  );
};

export default App;
