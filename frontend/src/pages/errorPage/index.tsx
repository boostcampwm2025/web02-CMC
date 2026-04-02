import { useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import Icon from '@/commons/components/Icon';
import * as Sentry from '@sentry/react';
import { useEffect } from 'react';

const ERROR_CODE_SNIPPET = `// 오류 발생 
function findPage(url) {
  const page = database.find(url);
  
  if (!page) {
    throw new Error(
      "페이지를 찾을 수 없습니다! 😢"
    );
  }
  
  return page;
}`;

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage = '페이지를 찾을 수 없습니다!';
  let errorCode = '404';
  let errorDescription = '존재하지 않는 경로이거나 삭제된 배틀입니다.';

  if (isRouteErrorResponse(error)) {
    errorCode = error.status.toString();
    if (error.status === 404) {
      errorMessage = '페이지를 찾을 수 없습니다!';
      errorDescription = '존재하지 않는 경로이거나 삭제된 배틀입니다.';
    } else if (error.status === 500) {
      errorMessage = '서버 오류가 발생했습니다!';
      errorDescription = '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
  }

  useEffect(() => {
    if (error) {
      Sentry.captureException(error, {
        level: 'error',
        tags: {
          errorBoundary: 'router',
          errorCode: errorCode
        },
        extra: {
          url: window.location.href,
          timestamp: new Date().toISOString(),
          errorMessage: errorMessage,
          isRouteError: isRouteErrorResponse(error),
          routeErrorStatus: isRouteErrorResponse(error) ? error.status : undefined
        }
      });
    }
  }, [error, errorCode, errorMessage]);

  const handleGoHome = () => {
    navigate('/main');
  };

  return (
    <div className="min-h-screen mt-2 rounded-xl border-t-8 border-orange-600 bg-[#1A1A2E] flex items-center justify-center px-4">
      <div className="max-w-xl w-full">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full"></div>
            <div className="relative bg-orange-500/10 p-6 rounded-full border border-orange-500/30">
              <Icon name="alertTriangle" className="w-12 h-12 text-orange-500" />
            </div>
          </div>
        </div>

        <h1 className="text-7xl font-bold text-center mb-6 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
          {errorCode}
        </h1>

        <h2 className="text-2xl font-bold text-white text-center mb-4">{errorMessage}</h2>

        <p className="text-[#6A7282] text-xs mb-4 text-center">{errorDescription}</p>

        <div className="bg-[#0A0A1A] rounded-lg overflow-hidden mb-8 border border-[#1E2939]">
          <div className="flex items-center gap-2 py-2 px-4 bg-[#0A0A1A]">
            <div className="w-3 h-3 mt-[2px] rounded-full bg-red-500"></div>
            <div className="w-3 h-3 mt-[2px] rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 mt-[2px] rounded-full bg-green-500"></div>
            <span className="text-sm text-[#6A7282]">error.js</span>
          </div>
          <pre className="px-4 py-2 pb-6 text-[#FF8904] font-mono text-sm overflow-x-auto text-left">
            <code>{ERROR_CODE_SNIPPET}</code>
          </pre>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-orange-500/50"
          >
            <Icon name="home" className="w-5 h-5" />
            홈으로 돌아가기
          </button>
        </div>
        <hr className="border-[#1E2939]" />
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg p-4">
            <div className="text-2xl text-orange-500">100%</div>
            <div className="text-xs text-[#6A7282] mt-1">실패율</div>
          </div>
          <div className="rounded-lg p-4 ">
            <div className="text-2xl  text-orange-500">0</div>
            <div className="text-xs text-[#6A7282] mt-1">복구 횟수</div>
          </div>
          <div className="rounded-lg p-4 ">
            <div className="text-2xl text-orange-500">{errorCode}</div>
            <div className="text-xs text-[#6A7282] mt-1">에러 코드</div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">
          💡 팁: 홈 화면에서 진행 중인 배틀을 확인하고 참여해보세요!
        </p>
      </div>
    </div>
  );
}
