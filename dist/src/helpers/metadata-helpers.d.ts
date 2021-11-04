import { PublicKey } from "@solana/web3.js";
import { Metadata } from "./metaplex/classes.js";
export declare const programIds: () => {
    token: PublicKey;
    associatedToken: PublicKey;
    bpf_upgrade_loader: PublicKey;
    system: PublicKey;
    metadata: string;
    memo: PublicKey;
    vault: string;
    auction: string;
    metaplex: string;
    store: PublicKey | undefined;
};
export declare function getMetadata(pubkey: PublicKey, url: string): Promise<Metadata | undefined>;
