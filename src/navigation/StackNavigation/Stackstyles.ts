import {
  StyleSheet,
  Dimensions,
} from 'react-native'
import colors from '../../utils/colors';
import { isIOS } from '../../utils/helpers';


const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  errorDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: colors.text,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  loginButtonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '600',
  },
});

export const fabStyles = StyleSheet.create({
  btn: {
    position: 'absolute',
    bottom: isIOS ? height * 0.12 : height * 0.11,
    left: width * 0.05,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    zIndex: 999,
  },
  icon: {
    width: 32,
    height: 32,
    tintColor: colors.black,
  },
});