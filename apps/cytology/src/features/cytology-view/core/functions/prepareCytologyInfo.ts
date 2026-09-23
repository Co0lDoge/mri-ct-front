import { ICytolgyInfoPatch, ICytologyInfo } from "@cytology/core/types/cytology";

export const prepareCytologyInfo = (cytologyInfo: ICytologyInfo): ICytolgyInfoPatch => ({
    patient_card: {
        patient: cytologyInfo.patient.id,
        diagnosis: cytologyInfo.diagnosis,
    },
    details: {
        material_type: cytologyInfo.material_type,
        calcitonin: cytologyInfo.calcitonin,
        calcitonin_in_flush: cytologyInfo.calcitonin_in_flush,
        thyroglobulin: cytologyInfo.thyroglobulin,
    },
    material_type: cytologyInfo.material_type,
    calcitonin: cytologyInfo.calcitonin,
    calcitonin_in_flush: cytologyInfo.calcitonin_in_flush,
    thyroglobulin: cytologyInfo.thyroglobulin,
});
