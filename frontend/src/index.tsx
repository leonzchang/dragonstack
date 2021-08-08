import React from 'react'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
import thunk ,{ ThunkMiddleware }from 'redux-thunk'
import { Router, Switch, Route, Redirect, RouteProps} from 'react-router-dom'
import  rootReducer  from './reducers'
import { fetchAuthenticated } from './actions/account'
import Root from './components/Root'
import AccountDragons from './components/AccountDragons'
import PublicDragons from './components/PublicDragons'
import history from './history'
import './index.css'



const store = createStore(rootReducer,applyMiddleware(thunk as ThunkMiddleware))

const AuthRoute = (props:RouteProps) =>{
    if (!store.getState().account.loggedIn){
        return <Redirect to={{pathname:'/'}} />
    }
    
    const {component, path} = props

    return <Route path={path} component={component}/>
}


store.dispatch(fetchAuthenticated())
    .then(()=>{
        render(
            <Provider store={store}>
                <Router history={history}>
                    <Switch>
                        <Route exact path='/' component={Root}/>
                        <AuthRoute path='/account-dragons' component={AccountDragons}/>
                        <AuthRoute path='/public-dragons' component={PublicDragons}/>
                    </Switch>
                </Router>
            </Provider>,
            document.getElementById('root')
        )
    })

// store.subscribe(()=>console.log('store state update',store.getState()))


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch