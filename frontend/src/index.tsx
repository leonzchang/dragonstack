import React from 'react'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
import thunk from 'redux-thunk'
import Generation from './components/Generation'
import Dragon from './components/Dragon'
import  rootReducer  from './reducers'
import './index.css'


const store = createStore(rootReducer,applyMiddleware(thunk))

store.subscribe(()=>console.log('store state update',store.getState()))

render(
    <Provider store={store}>
        <div>
            <h2>Dragon Stack</h2>
            <Generation />
            <Dragon />
        </div>
    </Provider>,
    document.getElementById('root')
)


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch