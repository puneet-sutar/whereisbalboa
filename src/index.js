import React from 'react'
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router'
import routes from './routes'
import registerServiceWorker from './registerServiceWorker';


ReactDOM.render(<Router routes={routes} history={browserHistory}/>, document.getElementById('app'));
registerServiceWorker();