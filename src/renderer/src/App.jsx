import { HashRouter as Router } from 'react-router-dom';
import React, { Suspense, useEffect } from 'react';
import { AliveScope } from "react-activation";
import Skeleton from '@/components/views/Skeleton';
import RootComp from './routes';
import API from '@/utils/ipcRenderer';
import { updateLocalStore } from '@/utils/utils';



const App = () => {
  useEffect(() => {
    updateLocalStore();
    API.IpcHandelEvent('updateLocalStore', () => {
      updateLocalStore();
    });
  }, []);

  return (
    <Router>
      <Suspense fallback={<Skeleton />}>
        <AliveScope>
          <RootComp />
        </AliveScope>
      </Suspense>
    </Router>
  )
}

export default App;
