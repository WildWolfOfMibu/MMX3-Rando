import { hexc, conv } from './mmx3/utils.js'

export type Options = {
    wStageIdx: number,
    wChipsAndRideArmoursGottenBitfield: number,
    Enemy_y: number,
    Enemy_type: number,
    Enemy_subType: number,
    Enemy_sizeof: number,
    wEnemyEntities: number,
    wBeatenStageIdx: number,
    wTextRowVramAddr: number,
    wJoy1CurrButtonsHeld: number,
    wJoy1CurrBtnsPressed: number,
    wCurrHealth: number,
    wNumLives: number,
    wFrameCounter: number,
    wSubTanksAndUpgradesGottenBitfield: number,
    wMaxHealth: number,
    wHealthTanksGottenBitfield: number,
}

type AsmObj = {
    asm: string[]
    len: number
    placement: number
    bank: number
}

type Asm = { [key: string]: AsmObj }

export class M65816 {
    symbols: { [key: string]: number };
    labels: { [key: string]: [string, number] };
    asm: Asm;
    loopsToBreakOn: number;
    randomNameIdx: number;
    bankEnds: { [key: number]: number };
    currOffs: number;
    currBlockName: string;

    constructor(symbols: { [key: string]: number }, bankEnds: { [key: number]: number }) {
        this.labels = {};
        this.asm = {};
        this.symbols = symbols ? symbols : {};
        this.loopsToBreakOn = 20;
        this.randomNameIdx = 0;
        this.bankEnds = bankEnds ? bankEnds : {};

        this.currOffs = 0;
        this.currBlockName = '';
    }

    getTokens(line: string): string[] {
        let tokens: string[] = [];
        let lineI = 0;
        let tokenI = 0;
        let loops = 0;
        let seps = ' #.,()';
        while (lineI < line.length) {
            let nextLineI: number | undefined;
            tokenI = lineI;
            while (true) {
                if (tokenI === line.length) {
                    let token = line.substring(lineI, tokenI);
                    if (token)
                        tokens.push(token);
                    break;
                }

                let ch = line[tokenI];
                if (seps.indexOf(ch) !== -1) {
                    let token = line.substring(lineI, tokenI);
                    if (token)
                        tokens.push(token);
                    nextLineI = tokenI + 1;
                    if (ch !== ' ')
                        tokens.push(ch);
                    break;
                }
                tokenI++;
            }
            lineI = nextLineI ? nextLineI : tokenI

            if (++loops === this.loopsToBreakOn)
                throw new Error('Error parsing asm');

        }
        return tokens;
    }

    toBankAddr(romOffs: number): number {
        let bank = romOffs >> 15;
        let romAddr = (romOffs & 0x7fff) + 0x8000;
        return (bank << 16) | romAddr;
    }

    parseNumber(num: string): number {
        if (num.length === 0) throw new Error('No number to parse');
        let radix = 10;
        let numPart = num;
        if (num[0] === '$') {
            radix = 16;
            numPart = num.slice(1, num.length);
        }

        let ret = parseInt(numPart, radix);
        if (!isNaN(ret)) return ret;

        if (this.symbols[num] !== undefined) return this.symbols[num];

        if (this.labels[num] === undefined) throw new Error(`Could not parse number ${num}`);
        let [blockName, offs] = this.labels[num];
        if (this.asm[blockName] === undefined) throw new Error(`Could not find block with name ${blockName}`);
        let romOffs = this.asm[blockName].placement + offs;
        return this.toBankAddr(romOffs);
    }

    getAbs(mnem: string, tokens: string[], getSize: boolean): number[] {
        if (tokens.length !== 1) throw new Error(`Incorrect args passed to ${mnem} abs`);

        let value = getSize ? 0 : this.parseNumber(tokens[0]);

        let lb = value & 0xff;
        return [lb, (value >> 8) & 0xff];
    }

    getLong(mnem: string, tokens: string[], getSize: boolean): number[] {
        if (tokens.length !== 1) throw new Error(`Incorrect args passed to ${mnem} abs`);

        let value = getSize ? 0 : this.parseNumber(tokens[0]);

        let lb = value & 0xff;
        value >>= 8;
        let mid = (value & 0xff);
        return [lb, mid, value >> 8];
    }

    getDp(mnem: string, tokens: string[], getSize: boolean): number[] {
        if (tokens.length !== 1) throw new Error(`Incorrect args passed to ${mnem} abs`);

        let value = getSize ? 0 : this.parseNumber(tokens[0]);

        let lb = value & 0xff;
        return [lb];
    }

    getImm(mnem: string, tokens: string[], getSize: boolean): number[] {
        if (tokens.length !== 3 || tokens[1] !== '.') throw new Error(`Incorrect args passed to ${mnem} imm`);
        let size = 'bw'.indexOf(tokens[2]);
        if (size === -1) throw new Error(`Incorrect size for ${mnem} imm`);

        let value = getSize ? 0 : this.parseNumber(tokens[0]);

        let lb = value & 0xff;
        if (size === 0) return [lb];
        return [lb, (value >> 8) & 0xff];
    }

    getRel(mnem: string, tokens: string[], getSize: boolean): number[] {
        if (tokens.length !== 1) throw new Error(`Incorrect args passed to ${mnem} rel`);
        if (getSize) return [0];

        let dest = tokens[0];
        let destAddr = this.parseNumber(dest);
        let currRomOffs = this.asm[this.currBlockName].placement + this.currOffs;
        let currOffs = this.toBankAddr(currRomOffs);
        let rel = destAddr - (currOffs + 2);
        if (Math.abs(rel) >= 0x80) throw new Error(`Relative branch for destination, ${dest}, too large: ${hexc(rel)}`);
        return rel >= 0 ? [rel] : [rel + 0x100];
    }

    adc(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to adc');
        if (tokens[0] === '#') {
            return [0x69, ...this.getImm('adc', tokens.slice(1, tokens.length), getSize)];
        } else if (tokens[tokens.length - 1] == 'b') {
            return [0x65, ...this.getDp('adc', tokens.slice(0, 1), getSize)];
        } else {
            throw new Error(`Could not process adc ${tokens}`);
        }
    }

    and(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to and');
        if (tokens[0] === '#') {
            return [0x29, ...this.getImm('and', tokens.slice(1, tokens.length), getSize)];
        } else if (tokens[tokens.length - 1] == 'b') {
            return [0x25, ...this.getDp('and', tokens.slice(0, 1), getSize)];
        } else if (tokens[tokens.length - 1] == 'w') {
            return [0x2d, ...this.getAbs('and', tokens.slice(0, 1), getSize)];
        } else {
            throw new Error(`Could not process and ${tokens}`);
        }
    }

    asl(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to asl');
        if (tokens[0] === 'a') {
            return [0x0a];
        } else {
            throw new Error(`Could not process asl ${tokens}`);
        }
    }

    bcc(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to bcc');
        return [0x90, ...this.getRel('bcc', tokens, getSize)];
    }

    bcs(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to bcs');
        return [0xb0, ...this.getRel('bcs', tokens, getSize)];
    }

    beq(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to beq');
        return [0xf0, ...this.getRel('beq', tokens, getSize)];
    }

    bit(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to bit');
        if (tokens[0] === '#') {
            return [0x89, ...this.getImm('bit', tokens.slice(1, tokens.length), getSize)];
        } else if (tokens[tokens.length - 1] == 'b') {
            return [0x24, ...this.getDp('bit', tokens.slice(0, 1), getSize)];
        } else if (tokens[tokens.length - 1] == 'w') {
            return [0x2c, ...this.getAbs('bit', tokens.slice(0, 1), getSize)];
        } else if (tokens[tokens.length - 3] == 'w' && tokens[tokens.length - 2] == ',' && tokens[tokens.length - 1] == 'X') {
            return [0x3c, ...this.getAbs('bit', tokens.slice(0, 1), getSize)];
        } else {
            throw new Error(`Could not process bit ${tokens}`);
        }
    }

    bne(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to bne');
        return [0xd0, ...this.getRel('bne', tokens, getSize)];
    }

    bpl(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to bpl');
        return [0x10, ...this.getRel('bpl', tokens, getSize)];
    }

    bra(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to bra');
        return [0x80, ...this.getRel('bra', tokens, getSize)];
    }

    bvc(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to bvc');
        return [0x50, ...this.getRel('bvc', tokens, getSize)];
    }

    bvs(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to bvs');
        return [0x70, ...this.getRel('bvs', tokens, getSize)];
    }

    clc(tokens: string[], getSize: boolean): number[] {
        return [0x18];
    }

    cmp(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to cmp');
        if (tokens[0] === '#') {
            return [0xc9, ...this.getImm('cmp', tokens.slice(1, tokens.length), getSize)];
        } else if (tokens[tokens.length - 1] == 'w') {
            return [0xcd, ...this.getAbs('cmp', tokens.slice(0, 1), getSize)];
        } else {
            throw new Error(`Could not process cmp ${tokens}`);
        }
    }

    dex(tokens: string[], getSize: boolean): number[] {
        return [0xca];
    }

    dey(tokens: string[], getSize: boolean): number[] {
        return [0x88];
    }

    inc(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to inc');
        if (tokens[0] === 'a') {
            return [0x1a];
        } else if (tokens[tokens.length - 1] == 'b') {
            return [0xe6, ...this.getDp('inc', tokens.slice(0, 1), getSize)];
        } else {
            throw new Error(`Could not process inc ${tokens}`);
        }
    }

    inx(tokens: string[], getSize: boolean): number[] {
        return [0xe8];
    }

    iny(tokens: string[], getSize: boolean): number[] {
        return [0xc8];
    }

    jmp(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to jmp');
        if (tokens[tokens.length - 1] == 'w') {
            return [0x4c, ...this.getAbs('jmp', tokens.slice(0, 1), getSize)];
        } else {
            throw new Error(`Could not process jmp ${tokens}`);
        }
    }

    jsr(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to jsr');
        if (tokens[tokens.length - 1] == 'w') {
            return [0x20, ...this.getAbs('jsr', tokens.slice(0, 1), getSize)];
        } else if (tokens[tokens.length - 1] == 'l') {
            return [0x22, ...this.getLong('jsr', tokens.slice(0, 1), getSize)];
        } else {
            throw new Error(`Could not process jsr ${tokens}`);
        }
    }

    lda(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to lda');
        if (tokens[0] === '#') {
            return [0xa9, ...this.getImm('lda', tokens.slice(1, tokens.length), getSize)];
        } else if (tokens[tokens.length - 1] == 'b') {
            return [0xa5, ...this.getDp('lda', tokens.slice(0, 1), getSize)];
        } else if (tokens[tokens.length - 1] == 'w') {
            return [0xad, ...this.getAbs('lda', tokens.slice(0, 1), getSize)];
        } else if (tokens[tokens.length - 3] == 'w' && tokens[tokens.length - 2] == ',' && tokens[tokens.length - 1] == 'X') {
            return [0xbd, ...this.getAbs('lda', tokens.slice(0, 1), getSize)];
        } else if (tokens[tokens.length - 3] == 'w' && tokens[tokens.length - 2] == ',' && tokens[tokens.length - 1] == 'Y') {
            return [0xb9, ...this.getAbs('lda', tokens.slice(0, 1), getSize)];
        } else if (tokens[tokens.length - 1] == 'l') {
            return [0xaf, ...this.getLong('lda', tokens.slice(0, 1), getSize)];
        } else if (tokens[tokens.length - 3] == 'l' && tokens[tokens.length - 2] == ',' && tokens[tokens.length - 1] == 'X') {
            return [0xbf, ...this.getLong('lda', tokens.slice(0, 1), getSize)];
        } else if (tokens[tokens.length - 1] == ')') {
            return [0xb2, ...this.getDp('lda', tokens.slice(1, 2), getSize)];
        } else {
            throw new Error(`Could not process lda ${tokens}`);
        }
    }

    ldx(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to ldx');
        if (tokens[0] === '#') {
            return [0xa2, ...this.getImm('ldx', tokens.slice(1, tokens.length), getSize)];
        } else if (tokens[tokens.length - 1] == 'b') {
            return [0xa6, ...this.getDp('ldx', tokens.slice(0, 1), getSize)];
        } else {
            throw new Error(`Could not process ldx ${tokens}`);
        }
    }

    ldy(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to ldy');
        if (tokens[0] === '#') {
            return [0xa0, ...this.getImm('ldy', tokens.slice(1, tokens.length), getSize)];
        } else {
            throw new Error(`Could not process ldy ${tokens}`);
        }
    }

    lsr(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) {
            return [0x4a];
        } else {
            throw new Error(`Could not process lsr ${tokens}`);
        }
    }

    nop(tokens: string[], getSize: boolean): number[] {
        return [0xea];
    }

    ora(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to ora');
        if (tokens[0] === '#') {
            return [0x09, ...this.getImm('ora', tokens.slice(1, tokens.length), getSize)];
        } else if (tokens[tokens.length - 1] == 'w') {
            return [0x0d, ...this.getAbs('ora', tokens.slice(0, 1), getSize)];
        } else {
            throw new Error(`Could not process ora ${tokens}`);
        }
    }

    pea(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to pea');
        if (tokens[tokens.length - 1] == 'w') {
            return [0xf4, ...this.getAbs('pea', tokens.slice(0, 1), getSize)];
        } else {
            throw new Error(`Could not process pea ${tokens}`);
        }
    }

    pha(tokens: string[], getSize: boolean): number[] {
        return [0x48];
    }

    phd(tokens: string[], getSize: boolean): number[] {
        return [0x0b];
    }

    php(tokens: string[], getSize: boolean): number[] {
        return [0x08];
    }

    phx(tokens: string[], getSize: boolean): number[] {
        return [0xda];
    }

    pla(tokens: string[], getSize: boolean): number[] {
        return [0x68];
    }

    pld(tokens: string[], getSize: boolean): number[] {
        return [0x2b];
    }

    plp(tokens: string[], getSize: boolean): number[] {
        return [0x28];
    }

    plx(tokens: string[], getSize: boolean): number[] {
        return [0xfa];
    }

    rep(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to rep');
        if (tokens[0] === '#') {
            return [0xc2, ...this.getImm('rep', tokens.slice(1, tokens.length), getSize)];
        } else {
            throw new Error(`Could not process rep ${tokens}`);
        }
    }

    rtl(tokens: string[], getSize: boolean): number[] {
        return [0x6b];
    }

    rts(tokens: string[], getSize: boolean): number[] {
        return [0x60];
    }

    sbc(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to sbc');
        if (tokens[0] === '#') {
            return [0xe9, ...this.getImm('sbc', tokens.slice(1, tokens.length), getSize)];
        } else {
            throw new Error(`Could not process sbc ${tokens}`);
        }
    }

    sec(tokens: string[], getSize: boolean): number[] {
        return [0x38];
    }

    sep(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to sep');
        if (tokens[0] === '#') {
            return [0xe2, ...this.getImm('sep', tokens.slice(1, tokens.length), getSize)];
        } else {
            throw new Error(`Could not process sep ${tokens}`);
        }
    }

    sta(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to sta');
        if (tokens[tokens.length - 1] == 'b') {
            return [0x85, ...this.getDp('sta', tokens.slice(0, 1), getSize)];
        } else if (tokens[tokens.length - 1] == 'w') {
            return [0x8d, ...this.getAbs('sta', tokens.slice(0, 1), getSize)];
        } else if (tokens[tokens.length - 3] == 'w' && tokens[tokens.length - 2] == ',' && tokens[tokens.length - 1] == 'X') {
            return [0x9d, ...this.getAbs('sta', tokens.slice(0, 1), getSize)];
        } else if (tokens[tokens.length - 3] == 'w' && tokens[tokens.length - 2] == ',' && tokens[tokens.length - 1] == 'Y') {
            return [0x99, ...this.getAbs('sta', tokens.slice(0, 1), getSize)];
        } else if (tokens[tokens.length - 1] == 'l') {
            return [0x8f, ...this.getLong('sta', tokens.slice(0, 1), getSize)];
        } else {
            throw new Error(`Could not process sta ${tokens}`);
        }
    }

    stx(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to stx');
        if (tokens[tokens.length - 1] == 'b') {
            return [0x86, ...this.getDp('stx', tokens.slice(0, 1), getSize)];
        } else if (tokens[tokens.length - 1] == 'w') {
            return [0x8e, ...this.getAbs('stx', tokens.slice(0, 1), getSize)];
        } else {
            throw new Error(`Could not process stx ${tokens}`);
        }
    }

    sty(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to sty');
        if (tokens[tokens.length - 1] == 'w') {
            return [0x8c, ...this.getAbs('sty', tokens.slice(0, 1), getSize)];
        } else {
            throw new Error(`Could not process sty ${tokens}`);
        }
    }

    stz(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to stz');
        if (tokens[tokens.length - 1] == 'b') {
            return [0x64, ...this.getDp('stz', tokens.slice(0, 1), getSize)];
        } else {
            throw new Error(`Could not process stz ${tokens}`);
        }
    }

    tax(tokens: string[], getSize: boolean): number[] {
        return [0xaa];
    }

    tay(tokens: string[], getSize: boolean): number[] {
        return [0xa8];
    }

    tcd(tokens: string[], getSize: boolean): number[] {
        return [0x5b];
    }

    tdc(tokens: string[], getSize: boolean): number[] {
        return [0x7b];
    }

    tsb(tokens: string[], getSize: boolean): number[] {
        if (tokens.length === 0) throw new Error('No args passed to tsb');
        if (tokens[tokens.length - 1] == 'w') {
            return [0x0c, ...this.getAbs('tsb', tokens.slice(0, 1), getSize)];
        } else {
            throw new Error(`Could not process tsb ${tokens}`);
        }
    }

    txy(tokens: string[], getSize: boolean): number[] {
        return [0x9b];
    }

    tya(tokens: string[], getSize: boolean): number[] {
        return [0x98];
    }

    tyx(tokens: string[], getSize: boolean): number[] {
        return [0xbb];
    }

    xba(tokens: string[], getSize: boolean): number[] {
        return [0xeb];
    }

    /**
     * Adds assembly code to the bank at the specified address.
     *
     * @param {number} placeBank The bank to add the assembly code to.
     * @param {number} placeAddr The address to add the assembly code to.
     * @param {string} asm The assembly code to add.
     * @param {string} name The name of the assembly code.
     */
    addAsm(placeBank: number | null, placeAddr: number | null, asm: string, name?: string): void {
        console.log(`AddAsm:\n\tbank:${placeBank}\n\taddr:${placeAddr}\n\tasm:${asm}`);

        let offs = 0;
        let labelOffs: [string, number][] = [];
        let asmLines: string[] = [];
        for (let line of asm.split('\n')) {
            line = line.trim();

            let commentIdx = line.indexOf(';');
            if (commentIdx !== -1) {
                line = line.substring(0, commentIdx);
            }

            if (line.length === 0) continue;

            if (line[line.length - 1] === ':') {
                labelOffs.push([line.substring(0, line.length - 1), offs]);
                continue;
            }

            asmLines.push(line);

            let tokens = this.getTokens(line);
            if (tokens.length === 0) throw new Error('Error parsing line');
            let mnem = tokens[0];
            // let mthd = (this[mnem as keyof typeof this]);
            // if (typeof mthd !== 'function') throw new Error(`No mnemonic ${mnem}`);
            // let byteData = mthd(tokens.slice(1, tokens.length), true);

            //TODO: convert this to TS
            //@ts-ignore
            if (this[mnem] === undefined) throw new Error(`No mnemonic ${mnem}`);
            //@ts-ignore
            let byteData = this[mnem](tokens.slice(1, tokens.length), true);
            offs += byteData.length;
        }

        if (!name) name = `asmBlock${this.randomNameIdx++}`;

        for (let [labelName, offs] of labelOffs) {
            this.labels[labelName] = [name, offs];
        }

        if (placeBank === null) {
            placeBank = 0x13;
        }

        if (placeAddr === null) {
            placeAddr = this.bankEnds[placeBank];
            this.bankEnds[placeBank] += offs;
        }

        let placement = conv(placeBank, placeAddr);

        this.asm[name] = {
            asm: asmLines,
            len: offs,
            placement: placement,
            bank: placeBank,
        };
    }

    addBytes(placeBank: number, bs: number[], rom: number[]): void {
        let start = conv(placeBank, this.bankEnds[placeBank]);
        for (let b of bs) {
            rom[start++] = b;
        }
        this.bankEnds[placeBank] += bs.length;
    }

    getLabelBank(label: string): number {
        let blockName = this.labels[label][0];
        let deets = this.asm[blockName];
        return deets.bank;
    }

    getLabelFullAddr(label: string): number {
        let [blockName, offs] = this.labels[label];
        let deets = this.asm[blockName];
        return deets.placement + offs;
    }

    compile(rom: number[]): void {
        console.log(`ASM:\n${this.asm}`)
        for (let name in this.asm) {
            let asm = this.asm[name].asm;
            let placement = this.asm[name].placement;
            this.currBlockName = name;

            //TODO: reduce this redundancy to addAsm() 
            let offs = 0;
            for (let line of asm) {
                this.currOffs = offs;

                let tokens = this.getTokens(line);
                if (tokens.length === 0) throw new Error('Error parsing line');
                let mnem = tokens[0];
                //TODO: convert this to TS
                //@ts-ignore
                if (this[mnem] === undefined) throw new Error(`No mnemonic ${mnem}`);
                //@ts-ignore
                let byteData = this[mnem](tokens.slice(1, tokens.length), false);

                offs += byteData.length;
                for (let i = 0; i < byteData.length; i++) {
                    rom[placement++] = byteData[i];
                    console.log(`Set: ${placement.toString(16)}:\t${byteData[i]}`);

                }
            }
        }
    }
}