import { Styles } from '@ijstech/components';
const Theme = Styles.Theme.ThemeVars;

export default Styles.style({
    $nest: {
        '.custom-box': {
          boxShadow: '0 3px 6px #00000029',
          backdropFilter: 'blur(74px)',
          boxSizing: 'border-box',
          overflow: 'hidden'
        },
        '.btn-os': {
            color: '#fff',
            fontWeight: 600,
            fontSize: '1rem',
            borderRadius: 5,
            background: Theme.background.gradient,
            $nest: {
                '&:disabled': {
                    color: '#fff'
                }
            }
        },
    }
})

export const voteListStyle = Styles.style({
    $nest: {
        '.truncate': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        '.expiry--text': {
            whiteSpace: 'inherit'
        },
        '.prevent-pointer': {
            cursor: 'not-allowed'
        },
        '.proposal-progress .i-progress_overlay, .proposal-progress .i-progress_bar': {
            borderRadius: '100px'
        }
    }
})

export const comboBoxStyle = Styles.style({
    width: '100% !important',
    $nest: {
        '.selection': {
            width: '100% !important',
            maxWidth: '100%',
            padding: '0.5rem 1rem',
            color: Theme.input.fontColor,
            backgroundColor: Theme.input.background,
            borderColor: Theme.input.background,
            borderRadius: '0.625rem!important',
        },

        '.selection input': {
            color: 'inherit',
            backgroundColor: 'inherit',
            padding: 0
        },

        '> .icon-btn': {
            justifyContent: 'center',
            borderColor: Theme.input.background,
            borderRadius: '0.625rem',
            width: '42px'
        }
    }
})

export const inputStyle = Styles.style({
    $nest: {
        'input': {
            color: Theme.text.third,
            padding: '0.375rem 0.5rem'
        }
    }
})

export const modalStyle = Styles.style({
  $nest: {
    '.modal': {
      padding: '1rem 1.5rem',
      borderRadius: '0.5rem'
    },
    '.modal .i-modal_header': {
      paddingBottom: '1.5rem'
    }
  }
})

export const flowInputStyle = Styles.style({
    $nest: {
        'input': {
            padding: '0.375rem 0.5rem'
        }
    }
})