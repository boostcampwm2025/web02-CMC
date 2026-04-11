import LoginModal from './LoginModal';
import NicknameChangeModal from './NicknameChangeModal';
import type useMainPageModals from '../../hooks/useMainPageModals';

interface MainPageModalLayerProps {
  loginModal: ReturnType<typeof useMainPageModals>['loginModal'];
  nicknameModal: ReturnType<typeof useMainPageModals>['nicknameModal'];
}

export default function MainPageModalLayer({ loginModal, nicknameModal }: MainPageModalLayerProps) {
  return (
    <>
      <LoginModal isOpen={loginModal.isOpen} onClose={loginModal.closeModal} />
      <NicknameChangeModal isOpen={nicknameModal.isOpen} onClose={nicknameModal.closeModal} />
    </>
  );
}
