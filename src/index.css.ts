import { Styles } from '@ijstech/components';
const Theme = Styles.Theme.ThemeVars;

export default Styles.style({
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