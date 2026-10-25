import type { CSSProperties } from 'react';

export const glassCardStyle: CSSProperties = {
    background: 'rgba(35, 35, 35, 0.65)',
    backdropFilter: 'saturate(180%) blur(15px)',
    WebkitBackdropFilter: 'saturate(180%) blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
};

export const elevatedGlassCardStyle: CSSProperties = {
    ...glassCardStyle,
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
};

export const shadowedGlassCardStyle: CSSProperties = {
    ...glassCardStyle,
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
};

export const modalGlassCardStyle: CSSProperties = {
    background: 'rgba(35, 35, 35, 0.65)',
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
};

export const strongModalGlassCardStyle: CSSProperties = {
    ...modalGlassCardStyle,
    background: 'rgba(35, 35, 35, 0.75)',
};

export const userGlassCardStyle: CSSProperties = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
};

export const commentSectionCardStyle: CSSProperties = {
    background: 'rgba(35, 35, 35, 0.45)',
    backdropFilter: 'saturate(180%) blur(15px)',
    WebkitBackdropFilter: 'saturate(180%) blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem',
};

export const commentItemCardStyle: CSSProperties = {
    background: 'rgba(35, 35, 35, 0.35)',
    backdropFilter: 'saturate(180%) blur(15px)',
    WebkitBackdropFilter: 'saturate(180%) blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem',
};

export const interactiveGlassCardStyle: CSSProperties = {
    ...glassCardStyle,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    overflow: 'hidden',
};

export const primaryTextStyle: CSSProperties = {
    color: 'rgba(255, 255, 255, 0.95)',
    textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
};

export const secondaryTextStyle: CSSProperties = {
    color: 'rgba(255, 255, 255, 0.75)',
};

export const mutedTextStyle: CSSProperties = {
    color: 'rgba(255, 255, 255, 0.7)',
};

export const shadowedSecondaryTextStyle: CSSProperties = {
    ...secondaryTextStyle,
    textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
};

export const brightShadowedSecondaryTextStyle: CSSProperties = {
    color: 'rgba(255, 255, 255, 0.85)',
    textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
};
