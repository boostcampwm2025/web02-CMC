import useModal from '@/commons/hooks/useModal';

export default function useMainPageModals() {
  const login = useModal();
  const nickname = useModal();

  return {
    loginModal: login,
    nicknameModal: nickname
  };
}
