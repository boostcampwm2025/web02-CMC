import { useBattleStore } from '../../stores/battleStore';

interface ModalContent {
  title: string;
  message: string;
  showSpinner: boolean;
  showReconnectButton: boolean;
}

export default function ConnectionErrorModal() {
  const connectionError = useBattleStore((state) => state.connectionError);
  const socket = useBattleStore((state) => state.socket);

  if (!connectionError.type) return null;

  const getModalContent = (): ModalContent | null => {
    const { type, message } = connectionError;

    switch (type) {
      case 'disconnected':
        return {
          title: '연결 끊김',
          message,
          showSpinner: false,
          showReconnectButton: false
        };

      case 'reconnecting':
        return {
          title: '재연결 중',
          message,
          showSpinner: true,
          showReconnectButton: false
        };

      case 'failed':
        return {
          title: '연결 실패',
          message,
          showSpinner: false,
          showReconnectButton: true
        };

      default:
        return null;
    }
  };

  const content = getModalContent();
  if (!content) return null;

  const handleReconnect = () => {
    socket?.connect();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm select-none">
      <div
        className="relative rounded-2xl bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] p-8 shadow-2xl border border-[#2B7FFF]/30"
        style={{ minWidth: '420px', maxWidth: '500px' }}
      >
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-white select-none">{content.title}</h2>
        </div>

        {content.showSpinner && (
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#2B7FFF]/20 border-t-[#2B7FFF]" />
          </div>
        )}

        <div className="mb-8 text-center px-4">
          <p className="text-lg text-gray-300 leading-relaxed select-none">{content.message}</p>
        </div>

        {content.showReconnectButton && (
          <div className="flex justify-center">
            <button
              onClick={handleReconnect}
              className="rounded-xl bg-gradient-to-r from-[#2B7FFF] to-[#1a5fd9] px-8 py-3.5 font-bold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-[#2B7FFF]/50"
            >
              다시 연결
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
