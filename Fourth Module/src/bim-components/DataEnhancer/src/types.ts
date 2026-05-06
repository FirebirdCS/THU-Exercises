export interface DataEnhancerSource {
    data: () => Promise<any[]>;
}