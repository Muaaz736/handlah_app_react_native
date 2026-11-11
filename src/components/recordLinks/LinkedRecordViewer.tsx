/* eslint-disable @typescript-eslint/no-explicit-any -- each viewer passes its module's own record shape to its own pop-up */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { apiHandle } from '../../config/apiHandle';
import { authenticateWithAlert } from '../../utils/biometricServices';
import { RECORD_LINK_MODULE } from '../../constants/recordLinkModules';
import type { LinkableRecord } from '../../services/recordLinks';
import ViewUtilityModal from '../common/ViewUtilityModal';
import ViewBankAccountModal from '../common/ViewBankAccountModal';
import ViewInsuranceModal from '../common/ViewInsuranceModal';
import ViewWarrantyModal from '../common/ViewWarrantyModal';
import ViewVehicleModal from '../common/ViewVehicleModal';
import ViewBookmarkModal from '../CustomModals/ViewBookmarkModal';
import ViewBusinessContactModal from '../CustomModals/ViewBusinessContactModal';
import ViewRealEstateModal from '../CustomModals/ViewRealEstateModal';
import ViewPersonalPropertyModal from '../CustomModals/ViewPersonalPropertyModal';

const M = RECORD_LINK_MODULE;

interface Viewer {
  /** GET path for one record. */
  path: (id: number) => string;
  render: (record: any, onClose: () => void) => React.ReactElement;
  /** Ask for Face ID / Touch ID / fingerprint first (modules whose records are protected). */
  protected?: boolean;
}

const noop = () => undefined;

/** Modules whose own detail pop-up can show a linked record on the current screen (as on the web). */
const VIEWERS: Record<string, Viewer> = {
  [M.Expense]: { path: id => `utilities/${id}`, render: (r, c) => <ViewUtilityModal visible onClose={c} utility={r} /> },
  [M.BankAccount]: { path: id => `bankaccounts/${id}`, render: (r, c) => <ViewBankAccountModal visible onClose={c} account={r} />, protected: true },
  [M.Insurance]: { path: id => `insurances/${id}`, render: (r, c) => <ViewInsuranceModal visible onClose={c} insurance={r} /> },
  [M.Warranty]: { path: id => `warranties/${id}`, render: (r, c) => <ViewWarrantyModal visible onClose={c} warranty={r} /> },
  [M.Bookmark]: { path: id => `bookmarks/${id}`, render: (r, c) => <ViewBookmarkModal visible onClose={c} bookmark={r} />, protected: true },
  [M.BusinessContact]: { path: id => `business-contacts/${id}`, render: (r, c) => <ViewBusinessContactModal visible onClose={c} contact={r} /> },
  [M.Vehicle]: {
    path: id => `vehicles/${id}`,
    render: (r, c) => <ViewVehicleModal visible onClose={c} vehicle={r} isLoading={false} actionable={false} canDelete={false} />,
  },
  [M.RealEstate]: {
    path: id => `real-estates/${id}`,
    render: (r, c) => (
      <ViewRealEstateModal
        visible
        onClose={c}
        property={r}
        isLoading={false}
        actionable={false}
        canDelete={false}
        onEditLoan={noop}
        onEditUtility={noop}
        onEditInsurance={noop}
        onEditWarranty={noop}
        onEditProperty={noop}
        onEditService={noop}
        onDeleteLoan={noop}
        onDeleteUtility={noop}
        onDeleteInsurance={noop}
        onDeleteWarranty={noop}
        onDeleteProperty={noop}
        onDeleteService={noop}
        {...({} as any)}
      />
    ),
  },
  [M.Property]: {
    path: id => `properties/${id}`,
    render: (r, c) => <ViewPersonalPropertyModal visible onClose={c} property={r} actionable={false} isLoading={false} {...({} as any)} />,
  },
};

export const hasRecordViewer = (moduleKey: string): boolean => moduleKey in VIEWERS;

/** The record itself from a by-id answer, which may wrap it ({ utility: {...} }, { data: {...} }). */
function unwrap(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if ('id' in data || 'Id' in data) return data;
  const objects = Object.values(data).filter(v => v && typeof v === 'object' && !Array.isArray(v)) as any[];
  return objects.find(o => 'id' in o || 'Id' in o) ?? data;
}

interface LinkedRecordViewerProps {
  link: LinkableRecord | null;
  businessId?: number | null;
  /** A record shared with you: read through the owner's share. */
  ownerUserId?: number | null;
  onClose: () => void;
  /** Couldn't load (or no viewer): show the summary pop-up instead. */
  onFallback: (link: LinkableRecord) => void;
}

/**
 * "View" on a linked record: the record's own module pop-up, over the current screen (as the web's
 * LinkedRecordViewDialog). Protected records ask for Face ID / Touch ID / fingerprint first.
 */
export function LinkedRecordViewer({ link, businessId, ownerUserId, onClose, onFallback }: LinkedRecordViewerProps) {
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const viewer = link ? VIEWERS[link.moduleKey] : undefined;

  useEffect(() => {
    if (!link || !viewer) return;
    let cancelled = false;
    setRecord(null);
    (async () => {
      if (viewer.protected) {
        const ok = await authenticateWithAlert({ showFailureAlert: true });
        if (!ok) {
          if (!cancelled) onClose();
          return;
        }
      }
      setLoading(true);
      try {
        const { data } = await apiHandle.get(viewer.path(link.id), {
          params: { businessId: businessId ?? undefined, ownerUserId: ownerUserId ?? undefined },
        });
        if (!cancelled) setRecord(unwrap(data));
      } catch {
        if (!cancelled) onFallback(link);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link?.moduleKey, link?.id]);

  if (!link || !viewer) return null;
  if (loading || !record) {
    return (
      <Modal visible transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </Modal>
    );
  }
  return viewer.render(record, onClose);
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
});
