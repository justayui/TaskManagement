import { useState } from 'react';
import BoardListPage from './pages/BoardListPage';
import BoardDetailPage from './pages/BoardDetailPage';

type View = { name: 'list' } | { name: 'detail'; boardId: string };

function App() {
  const [view, setView] = useState<View>({ name: 'list' });

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="flex items-center h-14 px-5 bg-white border-b border-gray-200">
        <button
          type="button"
          className="text-base font-bold"
          onClick={() => setView({ name: 'list' })}
        >
          📋 タスク管理ボード
        </button>
      </header>
      {view.name === 'list' ? (
        <BoardListPage onOpenBoard={(boardId) => setView({ name: 'detail', boardId })} />
      ) : (
        <BoardDetailPage boardId={view.boardId} onBack={() => setView({ name: 'list' })} />
      )}
    </div>
  );
}

export default App;
