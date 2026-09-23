import React, { useContext } from 'react'
import { Flex, Typography, Button } from 'antd'
import { DisconnectOutlined } from '@ant-design/icons'

import { ModalContext } from '@medml/ui'

import { useAppSelector } from '@cytology/core/hooks'
import { prepareCytologyInfo } from '@cytology/core/functions/prepareCytologyInfo'
import { getHighestProbIndex } from '@cytology/core/functions/highestProb'

import ViewEditConclusion from '../../ViewEditConclusion/ViewEditConclusion'
import ViewProbs from './ViewProbs/ViewProbs'
import CharacteristicsTable from './CharacteristicsTable/CharacteristicsTable'

import './CytologyInfo.css'

const { Text, Title } = Typography

const CytologyInfo = () => {
	const { open } = useContext(ModalContext)
	const cytologyInfo = useAppSelector(state => state.cytology.cytologyInfo)

	const patientData = cytologyInfo?.patient
	const probs = cytologyInfo?.details?.probs

	const handleViewProbs = () => {
		if (probs) {
			open({
				content: <ViewProbs probs={probs} />,
			})
		}
	}

	const handleResulCharacteristics = () => {
		if (cytologyInfo?.details?.cell_characteristics && cytologyInfo?.details?.cluster_characteristics) {
			open({
				content: (
					<CharacteristicsTable
						characteristics={{
							...cytologyInfo?.details?.cell_characteristics,
							...cytologyInfo?.details?.cluster_characteristics,
						}}
					/>
				),
			})
		}
	}

	const handleViewConclusion = () => {
		if (cytologyInfo) {
			open({
				content: <ViewEditConclusion initData={prepareCytologyInfo(cytologyInfo)} />,
			})
		}
	}

	return (
		<>
			{cytologyInfo && patientData && (
				<>
					<Title level={4}>
						Диагностика {cytologyInfo.diagnostic_marking}-{cytologyInfo.diagnostic_number} от{' '}
						{new Date(cytologyInfo?.diagnos_date).toLocaleDateString()}
					</Title>
					<Flex vertical>
						<Text type='secondary' strong>
							Новообразования
						</Text>
						{probs ? (
							<Button type='link' onClick={handleViewProbs} className='info-link-button'>
								<Title level={5} className='mt-0'>
									{getHighestProbIndex(probs)}
								</Title>
							</Button>
						) : (
							<Title level={5} className='mt-0'>
								Нет данных о категории
							</Title>
						)}
					</Flex>
					<Flex vertical>
						<Text type='secondary' strong>
							Результаты исследования
						</Text>
						<Button type='link' onClick={handleResulCharacteristics} className='info-link-button'>
							<Title level={5} className='mt-0'>
								Просмотреть
							</Title>
						</Button>
					</Flex>
					<Flex vertical>
						<Text type='secondary' strong>
							Заключение
						</Text>
						<Button type='link' onClick={handleViewConclusion} className='info-link-button'>
							<Title level={5} className='mt-0'>
								Просмотреть
							</Title>
						</Button>
					</Flex>
				</>
			)}
			{(!patientData || !cytologyInfo) && (
				<Flex align='center' justify='center'>
					<DisconnectOutlined style={{ fontSize: 25, color: '#8c8c8c' }} />
				</Flex>
			)}
		</>
	)
}

export default CytologyInfo
