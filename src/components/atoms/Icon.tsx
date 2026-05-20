import { View, ViewStyle } from 'react-native';
import { Colors } from '../../theme/Colors';
import { IconCalendar } from './icons/IconCalendar';
import { IconListBullet } from './icons/IconListBullet';
import { IconBanknote } from './icons/IconBanknote';
import { IconPercent } from './icons/IconPercent';
import { IconDocText } from './icons/IconDocText';
import { IconCreditCard } from './icons/IconCreditCard';
import { IconToday } from './icons/IconToday';
import { IconEqual } from './icons/IconEqual';
import { IconPaymentArrowDown } from './icons/IconPaymentArrowDown';
import { IconPercentDiscount } from './icons/IconPercentDiscount';
import { IconHeapSnapshot } from './icons/IconHeapSnapshot';
import { IconHourglass } from './icons/IconHourglass';
import { IconCalendarPick } from './icons/IconCalendarPick';
import { IconState } from './icons/IconState';
import { IconChevron } from './icons/IconChevron';
import { IconInfo } from './icons/IconInfo';

// Registry — add new custom SVG components here
const ICON_REGISTRY = {
    'calendar': IconCalendar,
    'list.bullet': IconListBullet,
    'banknote': IconBanknote,
    'percent': IconPercent,
    'doc.text': IconDocText,
    'creditcard': IconCreditCard,
    // Custom assets
    'today': IconToday,
    'equal': IconEqual,
    'payment_arrow_down': IconPaymentArrowDown,
    'percent_discount': IconPercentDiscount,
    'heap_snapshot': IconHeapSnapshot,
    // New icons
    'hourglass': IconHourglass,
    'calendar.pick': IconCalendarPick,
    'state': IconState,
    'chevron-back': IconChevron,
    'info': IconInfo,
} as const;

export type IconName = keyof typeof ICON_REGISTRY;

interface IconProps {
    name: IconName;
    size?: number;
    color?: keyof typeof Colors | string;
    style?: ViewStyle;
}

export const Icon = ({ name, size = 24, color = 'white', style }: IconProps) => {
    const colorRaw = Colors[color as keyof typeof Colors] ?? color;
    const colorStr = Array.isArray(colorRaw) ? colorRaw[0] : (colorRaw as string);
    const SvgIcon = ICON_REGISTRY[name];
    if (!SvgIcon) return null;
    return (
        <View style={style}>
            <SvgIcon size={size} color={colorStr} />
        </View>
    );
};
