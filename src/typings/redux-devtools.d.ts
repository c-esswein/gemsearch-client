/// <reference types="redux" />

interface Window {
  devToolsExtension?(): Redux.StoreEnhancer<any>,
}
