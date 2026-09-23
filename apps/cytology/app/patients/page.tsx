"use client";

import * as React from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

import {
  PatientCreateModal,
  stripPolicyDigits,
  type PatientCreateValuesCytology,
} from "@medml/patient_create";
import { PatientsPage, type PatientListSort } from "@medml/patient_list";

import { useAddPatientMutation, useGetMedWorkerPatientsQuery } from "@/lib/patientsApi";
import { useDoctorId } from "@/lib/useDoctorId";

export default function PatientsRoutePage() {
  const router = useRouter();
  const { doctorId, status } = useDoctorId();
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [addPatient, { isLoading: isAddingPatient }] = useAddPatientMutation();

  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<PatientListSort>({ key: null, order: null });

  const { data, isFetching } = useGetMedWorkerPatientsQuery(
    {
      doctorId,
      search: search.trim() || undefined,
      sortKey: sort.key,
      sortOrder: sort.order,
    },
    { skip: !doctorId || status !== "authenticated" }
  );

  const handleCreateFinish = async (values: PatientCreateValuesCytology) => {
    if (!doctorId) {
      message.warning("Не удалось определить врача");
      return;
    }
    try {
      await addPatient({
        medWorkerId: doctorId,
        payload: {
          patient: {
            first_name: values.firstName.trim(),
            last_name: values.lastName.trim(),
            fathers_name: values.fathersName.trim(),
            personal_policy: stripPolicyDigits(values.personalPolicy),
            email: values.email.trim(),
            ...(values.active ? { is_active: true } : {}),
            birth_date: dayjs(values.birthDate).format("YYYY-MM-DD"),
          },
          card: {
            diagnosis: values.diagnosis?.trim() ?? "",
          },
        },
      }).unwrap();
      message.success("Карта пациента создана");
      setCreateModalOpen(false);
    } catch {
      message.error("Не удалось создать карту пациента");
    }
  };

  return (
    <>
      <PatientsPage
        title={data?.medWorkerName ? `${data.medWorkerName}: пациенты` : "Мои пациенты"}
        rows={data?.rows ?? []}
        total={data?.total ?? 0}
        isLoading={(status === "authenticated" && !doctorId) || isFetching}
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={setSearch}
        sort={sort}
        onSortChange={setSort}
        onAddPatient={() => setCreateModalOpen(true)}
        onOpenPatientCard={(id) => router.push(`/patient_profile?id=${encodeURIComponent(String(id))}`)}
        onDeletePatient={(id) =>
          message.info(`Удаление карты ${String(id)} оставлено как placeholder для parity.`)
        }
      />
      <PatientCreateModal
        open={createModalOpen}
        variant="cytology"
        onCancel={() => setCreateModalOpen(false)}
        onFinish={(vals) => void handleCreateFinish(vals as PatientCreateValuesCytology)}
        confirmLoading={isAddingPatient}
      />
    </>
  );
}
