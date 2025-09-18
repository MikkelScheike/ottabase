import React from 'react';
import {
    IconAlertSquareRounded,
    IconHelpSquareRounded,
    IconInfoSquareRounded,
    IconLoader,
    IconLockSquareRounded,
    IconSquareRoundedCheck,
    IconSquareRoundedX,
    IconWifiOff,
} from '@tabler/icons-react';

type SkeletonVariant = 'spinner' | 'skeleton';

export type MessageTypes =
    | 'info'
    | 'error'
    | 'warning'
    | 'success'
    | 'help'
    | 'loginRequired'
    | 'disconnected'
    | 'loading';

export interface MessageBoxProps {
    isLoading?: boolean;
    loadingType?: SkeletonVariant;
    message?: React.ReactNode | Error | Record<string, unknown> | string;
    messageType?: MessageTypes;
}

const messageColorClass: Record<MessageTypes, string> = {
    info: 'text-blue-500 dark:text-blue-400',
    error: 'text-red-500 dark:text-red-400',
    warning: 'text-amber-500 dark:text-amber-400',
    success: 'text-emerald-500 dark:text-emerald-400',
    help: 'text-indigo-500 dark:text-indigo-400',
    loginRequired: 'text-slate-500 dark:text-slate-300',
    disconnected: 'text-zinc-500 dark:text-zinc-300',
    loading: 'text-blue-500 dark:text-blue-400',
};

const Loading: React.FC<{ skeletonType?: SkeletonVariant }> = ({ skeletonType = 'spinner' }) => {
    if (skeletonType === 'skeleton') {
        return (
            <div className="flex w-full flex-col gap-3" role="status" aria-live="polite">
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
        );
    }

    return (
        <IconLoader
            size={54}
            strokeWidth={1.5}
            className="animate-spin text-blue-500 dark:text-blue-400"
            aria-hidden="true"
        />
    );
};

const MessageIcon: React.FC<{ type: MessageTypes }> = ({ type }) => {
    const IconComponent = {
        info: IconInfoSquareRounded,
        error: IconSquareRoundedX,
        warning: IconAlertSquareRounded,
        success: IconSquareRoundedCheck,
        help: IconHelpSquareRounded,
        loginRequired: IconLockSquareRounded,
        disconnected: IconWifiOff,
        loading: IconLoader,
    }[type];

    const className = `${messageColorClass[type] ?? messageColorClass.info} mb-2.5`;
    return <IconComponent size={54} strokeWidth={1.25} className={className} aria-hidden="true" />;
};

const renderMessageContent = (
    message: MessageBoxProps['message'],
    setMessageType: (nextType: MessageTypes) => void,
): React.ReactNode => {
    if (React.isValidElement(message)) {
        return message;
    }

    if (typeof message === 'string') {
        return message;
    }

    if (message instanceof Error) {
        setMessageType('error');
        return message.message ?? message.name;
    }

    if (message && typeof message === 'object') {
        return (
            <pre className="max-w-full whitespace-pre-wrap break-words text-sm text-left">
                {JSON.stringify(message, null, 2)}
            </pre>
        );
    }

    return 'An error has occurred.';
};

const MessageBox: React.FC<MessageBoxProps> = ({
    isLoading,
    loadingType,
    message,
    messageType = 'info',
}) => {
    if (isLoading) {
        return (
            <div className="flex h-full min-h-32 w-full flex-col items-center justify-center rounded-md p-8 text-center">
                <Loading skeletonType={loadingType} />
            </div>
        );
    }

    let resolvedType: MessageTypes = messageType;
    const content = renderMessageContent(message, (nextType) => {
        resolvedType = nextType;
    });

    return (
        <div
            role={resolvedType === 'error' ? 'alert' : 'status'}
            className={`flex h-full min-h-32 w-full flex-col items-center justify-center rounded-md p-8 text-center ${resolvedType === 'error' ? 'cursor-not-allowed' : 'cursor-default'
                }`}
        >
            <MessageIcon type={resolvedType} />
            <div className="text-base text-gray-700 dark:text-gray-200">{content}</div>
        </div>
    );
};

export type { SkeletonVariant as SkeletonType };
export default MessageBox;
