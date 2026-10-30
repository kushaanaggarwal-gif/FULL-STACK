import { useDispatch, useSelector } from 'react-redux';

// Typed / standard convenience wrappers around useDispatch and useSelector
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
