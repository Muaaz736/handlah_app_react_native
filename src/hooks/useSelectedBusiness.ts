import { useSelector } from 'react-redux';
import { BusinessItem } from '../types/reduxTypes/businessSlice.types';

/**
 * Custom hook to get the selected business from Redux state
 * Can be used across the app to access current business context
 */
export const useSelectedBusiness = () => {
  const businesses = useSelector(
    (state: any) => state.business_slice?.get_businesses_data || []
  );
  const selectedBusinessId = useSelector(
    (state: any) => state.business_slice?.selectedBusinessId
  );

  // Safely find selected business with null checks
  const selectedBusiness: BusinessItem | undefined = Array.isArray(businesses)
    ? businesses.find((b: BusinessItem) => b && b.id === selectedBusinessId)
    : undefined;

  return {
    selectedBusiness,
    selectedBusinessId,
    businesses: Array.isArray(businesses) ? businesses : [],
    hasSelectedBusiness: !!selectedBusiness,
  };
};
