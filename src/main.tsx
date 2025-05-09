import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './store/storeIndex.ts'

const root = createRoot(document.getElementById("root")!);

root.render(
    <Provider store={store}>
        <App />
    </Provider>
)