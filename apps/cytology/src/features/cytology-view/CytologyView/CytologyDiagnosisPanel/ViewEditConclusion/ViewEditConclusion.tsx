import React, { useContext, useEffect } from "react";
import { Form, Input, Select } from "antd";
import { useForm } from "antd/es/form/Form";

import { ModalContext } from "@medml/ui";
import { useAppDispatch } from "@cytology/core/hooks";
import { setEditedCytologyInfo } from "@cytology/core/store";

import { ICytolgyInfoPatch, MaterialType } from "@cytology/core/types/cytology";

import { localizationOptions } from "./props";

const { TextArea } = Input;

interface ViewEditConclusionProps {
    editMode?: true;
    initData: ICytolgyInfoPatch;
}

interface FormData {
    materialType: MaterialType;
    calcitonin: number;
    thyroglobulin: number;
    calcitoninFlush: number;
    diagnosis: string;
}

const ViewEditConclusion: React.FC<ViewEditConclusionProps> = ({ editMode, initData }) => {
    const dispatch = useAppDispatch();
    const { changeModalProps, close } = useContext(ModalContext);
    const [form] = useForm<FormData>();

    const saveConclusion = (values: FormData) => {
        if (
            values.diagnosis !== initData.patient_card.diagnosis ||
            values.materialType !== initData.material_type ||
            values.calcitonin !== initData.calcitonin ||
            values.calcitoninFlush !== initData.calcitonin_in_flush ||
            values.thyroglobulin !== initData.thyroglobulin ||
            (initData.details &&
                (values.materialType !== initData.details.material_type ||
                    values.calcitonin !== initData.details.calcitonin ||
                    values.calcitoninFlush !== initData.details.calcitonin_in_flush ||
                    values.thyroglobulin !== initData.details.thyroglobulin))
        ) {
            dispatch(
                setEditedCytologyInfo({
                    patient_card: {
                        patient: initData.patient_card.patient,
                        diagnosis: values.diagnosis,
                    },
                    details: {
                        material_type: values.materialType,
                        calcitonin: values.calcitonin,
                        calcitonin_in_flush: values.calcitoninFlush,
                        thyroglobulin: values.thyroglobulin,
                    },
                    material_type: values.materialType,
                    calcitonin: values.calcitonin,
                    calcitonin_in_flush: values.calcitoninFlush,
                    thyroglobulin: values.thyroglobulin,
                })
            );
        }
    };

    useEffect(() => {
        form.setFieldsValue({
            materialType: initData.material_type,
            calcitonin: initData.calcitonin,
            thyroglobulin: initData.thyroglobulin,
            calcitoninFlush: initData.calcitonin_in_flush,
            diagnosis: initData.patient_card.diagnosis,
        });
    }, []);

    useEffect(() => {
        changeModalProps({
            title: "Заключение",
            footer: !editMode ? [] : undefined,
            centered: true,
            width: "70%",
            okText: "Подтвердить",
            onOk: () => {
                form.submit();
                close();
            },
            cancelText: "Отменить",
        });
    }, [editMode]);

    return (
        <Form layout="vertical" form={form} disabled={!editMode} onFinish={saveConclusion}>
            <Form.Item label="Локализация" name="materialType">
                <Select options={localizationOptions} />
            </Form.Item>
            <Form.Item label="Кальцитонин" name="calcitonin">
                <Input type="number" />
            </Form.Item>
            <Form.Item label="Тиреоглобулин в смыве" name="thyroglobulin">
                <Input type="number" />
            </Form.Item>
            <Form.Item label="Кальцитонин в смыве" name="calcitoninFlush">
                <Input type="number" />
            </Form.Item>
            <Form.Item label="Диагноз" name="diagnosis">
                <TextArea rows={4} />
            </Form.Item>
            {/* <Form.Item label="Описание">
                <TextArea rows={4} />
            </Form.Item>
            <Form.Item label="Заключение">
                <TextArea rows={4} />
            </Form.Item> */}
        </Form>
    );
};

export default ViewEditConclusion;
