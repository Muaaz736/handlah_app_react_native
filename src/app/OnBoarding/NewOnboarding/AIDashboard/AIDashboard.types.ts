import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../../types/RootStackParamList.types';
import { MockAttentionItem } from '../DashboardPreviewUI/DashboardPreviewUI.types';
import { makeGuidanceModalStyles, makeMarkDoneModalStyles } from './AIDashboard.styles';

export type AIDashboardRoute = RouteProp<RootStackParamList, 'AIDashboard'>;

export interface MarkDoneModalProps {
    visible: boolean;
    item: MockAttentionItem | null;
    accentColor: string;
    spaceType: 'Personal' | 'Business';
    businessId: number | null;
    onClose: () => void;
    onSuccess: () => void;
    ms: ReturnType<typeof makeMarkDoneModalStyles>;
}

export interface GuidanceModalProps {
    visible: boolean;
    item: MockAttentionItem | null;
    accentColor: string;
    onClose: () => void;
    gm: ReturnType<typeof makeGuidanceModalStyles>;
}
