import React from 'react'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
import thunk from 'redux-thunk'
import Root from './components/Root'
import  rootReducer  from './reducers'
import { fetchAuthenticated } from './actions/account'
import './index.css'


const store = createStore(rootReducer,applyMiddleware(thunk))

//need to fix
store.dispatch<any>(fetchAuthenticated())
    .then(()=>{
        render(
            <Provider store={store}>
                <Root />
            </Provider>,
            document.getElementById('root')
        )
    })

store.subscribe(()=>console.log('store state update',store.getState()))



// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch