import {
    Button,
    Container,
    Control,
    ControlElement,
    customElements,
    Label,
    Modal,
    Module,
    moment,
    Panel,
    Styles,
    VStack
} from "@ijstech/components";
import { State } from "./store/index";
import { voteListStyle } from "./index.css";
import { Utils, Wallet } from "@ijstech/eth-wallet";
import { getOptionVoted } from "./api";

const Theme = Styles.Theme.ThemeVars;

interface IOption {
    optionText: string;
    optionValue: string | number;
}

interface IData {
    options: IOption[];
    address: string;
    expiry: Date;
    selectedVotes?: string[]
}

interface IVoteListElement extends ControlElement {
    onSelect?: any;
    data?: IData;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-governance-voting-vote-list']: IVoteListElement
        }
    }
}
@customElements('i-scom-governance-voting-vote-list')
export class GovernanceVoteList extends Module {
    private dropdownStack: Panel;
    private lblDesc: Label;
    private btnChoice: Button;

    private _state: State;
    private userWeightVote: any = {};
    private selectedItem: IOption;
    private _data: IData;
    public onSelect: any;

    get data(): IData {
      return this._data
    }
  
    set data(value: IData) {
      this._data = value;
      this.renderUI();
    }

    get state(): State {
        return this._state;
    }

    set state(value: State) {
        this._state = value;
    }

    private get selectedChoiceText() {
      return this.selectedItem?.optionText || this.data?.selectedVotes[0] || this.optionValue
    }

    private get hasVoted() {
      return !(this.userWeightVote.weight == 0 || this.userWeightVote.weight == undefined);
    }

    private get isDropdownDisabled() {
      if (this.remainingTimeToBeExpired > 0) return false;
      else return true;
    }
  
    private get remainingTimeToBeExpired()  {
      if (!this.data.expiry) return 0;
      return moment(this.data.expiry).diff(Date());
    }
  
    private get optionValue() {
      if (!this.hasVoted || !this.data.options[this.userWeightVote.option]) {
        return 'Your choice';
      } else {
        const option: any = this.data.options[this.userWeightVote.option];
        return option.optionText;
      }
    }
  
    private get stakeVote() {
      if (!this.hasVoted) {
        if (this.remainingTimeToBeExpired > 0) return 'You have not voted yet!';
        else return 'Vote has ended!';
      }
      const chainId = this.state.getChainId();
      return `You staked: ${(+this.userWeightVote.weight).toLocaleString('en-US')} ${this.state.getGovToken(chainId).symbol}`;
    }
    
    init() {
        super.init();
        this.classList.add(voteListStyle);
        this.onSelect = this.getAttribute('onSelect', true) || this.onSelect;
        const dataAttr = this.getAttribute('data', true);
        if (dataAttr) this.data = dataAttr;
    }

    private async renderUI() {
      if (!this.dropdownStack) return;
      await this.getVoteOptions();
      this.dropdownStack.clearInnerHTML();
      this.btnChoice = await Button.create({
        caption: this.selectedChoiceText,
        width: '100%',
        padding: { top: '0.8rem', bottom: '0.8rem', left: '0.75rem', right: '0.75rem' },
        font: { size: '1.5rem', bold: true, color: '#fff' },
        rightIcon: { name: 'caret-down', width: 16, height: 16, fill: '#fff' },
        border: { radius: 0 },
        background: { color: `${Theme.background.gradient} !important` },
        enabled: !this.isDropdownDisabled,
        opacity: 1
      });
      this.btnChoice.onClick = () => modalElm.visible = !modalElm.visible;
      this.btnChoice.style.justifyContent = "space-between";
      if (this.isDropdownDisabled) this.btnChoice.classList.add('prevent-pointer');
      
      const modalElm = await Modal.create({
        minWidth: 300,
        showBackdrop: false,
        height: 'auto',
        popupPlacement: 'bottom'
      })
      modalElm.classList.add("account-dropdown");
      modalElm.style.width = '100%';
  
      const vstack = await VStack.create({
        gap: '15px'
      });
      const itemCaptions = this.data.options || [];
  
      itemCaptions.forEach(async (option: IOption, i: number) => {
        const buttonItem = await Button.create({
          caption: option.optionText,
          width: '100%',
          height: 'auto',
          padding: { top: '0.5rem', bottom: '0.5rem', left: '0.75rem', right: '0.75rem' }
        });
        buttonItem.onClick = (source: Control, event: Event): boolean => {
          event.stopPropagation();
          this.onSelectItem(option, i);
          modalElm.visible = false;
          return true;
        }
        vstack.appendChild(buttonItem);
        modalElm.item = vstack;
      })
      this.dropdownStack.append(this.btnChoice, modalElm);
      if (this.lblDesc) this.lblDesc.caption = this.stakeVote;
    }

    private onSelectItem(option: IOption, index: number) {
      this.selectedItem = option;
      if (this.btnChoice) this.btnChoice.caption = this.selectedChoiceText;
      if (this.onSelect) this.onSelect(index);
    }
  
    private getVoteOptions = async () => {
      const address = Wallet.getClientInstance().account.address;
      const getOptionVote = await getOptionVoted(this.state, this.data.address, address);
      this.userWeightVote = {
        option: getOptionVote?.option,
        weight: Utils.fromDecimals(getOptionVote?.weight??"").toFixed()
      };
      if (this.hasVoted && this.data.options[this.userWeightVote.option] && this.onSelect)
        this.onSelect(this.userWeightVote.option);
    };

    render() {
        return (
            <i-panel>
                <i-panel id="dropdownStack" minWidth={200}></i-panel>
                <i-label
                    id="lblDesc"
                    caption="Vote has ended!"
                    margin={{ top: '0.25rem' }}
                    font={{ size: '0.875rem', color: Theme.text.third }}
                    lineHeight={1.2}
                ></i-label>
            </i-panel>

        )
    }
}