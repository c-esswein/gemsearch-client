import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ConnectedApp } from 'components/app';

import { createStore, applyMiddleware, StoreEnhancer, compose } from 'redux';
import { mainReducer } from 'reducers';
import { StoreState, ViewModus } from 'types';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { DispatchContextProvider } from 'components/dispatchContextProvider';
import { AppContainer as ReactHotLoaderAppContainer } from 'react-hot-loader';

require('styles/index.scss');
require('styles/svg.scss');
/* require('styles/react-autosuggest.scss'); // TODO scss import is not working
require('styles/react-select.scss'); */
require('styles/buttons.scss');

function configureStore(initialState: StoreState) {
  const devToolsExtension: StoreEnhancer<any> = typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f;

  const enhancers = applyMiddleware(thunkMiddleware);
  const composed = compose(enhancers, devToolsExtension);

  const store = createStore(
    mainReducer as any, // reducer
    initialState, 
    composed
  );
  return store;
}

const store = configureStore(undefined);


const render = (App: React.ComponentClass<{}>) => {
  ReactDOM.render(
    (
      <ReactHotLoaderAppContainer>

        <DispatchContextProvider dispatch={store.dispatch}>
          <Provider store={store}>
            <App />
          </Provider>
        </DispatchContextProvider>

      </ReactHotLoaderAppContainer>
    ),
    document.getElementById('root'),
  );
};

render(ConnectedApp);


// Hot Module Replacement API https://github.com/gaearon/react-hot-loader/tree/master/docs#migration-to-30
declare const module: any;
if (module.hot) {
  module.hot.accept(
    'components/app',
    () => {
      render(ConnectedApp);

      console.log('react hot reloaded');
    },
  );
}
