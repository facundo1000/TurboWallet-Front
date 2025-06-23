import { useEffect, useState } from 'react';
import {
    IoArrowForward,
    IoCard,
    IoCheckmarkCircle,
    IoSwapHorizontalSharp,
    IoWarning
} from 'react-icons/io5';
import { useAccountStore } from '../hooks/useAccountStore';
import { useTransactionStore } from '../hooks/useTransactionStore';


const INITIAL_TRANSFER_STATE = {
    tipoTransferencia: 'TRANSFERENCIA',
    motivo: '',
    nombreDestinatario: '',
    bancoDestino: '',
    cbuAlias: '',
    cuentaOrigen: '',
    monto: '',
    estado: true
};


export const Transfer = () => {

    // Asumiendo que tienes un hook para obtener las cuentas
    const { accounts } = useAccountStore();
    const { createTransaction, isLoading } = useTransactionStore();
    const [localMessage, setLocalMessage] = useState(null);
    // const [isSending] = useState(false);
    const [transferDetails, setTransferDetails] = useState(INITIAL_TRANSFER_STATE);


    // Filtrar solo cuentas activas
    const activeAccounts = accounts.filter(account => account.estado !== false);

    // Encontrar la cuenta seleccionada
    const selectedAccount = activeAccounts.find(acc => acc.idCuenta === transferDetails.cuentaOrigen);

    // Determinar el saldo disponible
    const availableBalance = selectedAccount ? parseFloat(selectedAccount.saldo) || 0 : 0;

    // Obtener tarjetas de la cuenta seleccionada
    const availableCards = selectedAccount?.tarjetasDto?.filter(card => card.estado !== false) || [];

    // Verificar si se puede realizar la transferencia
    const canTransfer = selectedAccount && availableCards.length > 0 && transferDetails.tarjetaOrigen;

    useEffect(() => {
        if (localMessage) {
            const timer = setTimeout(() => setLocalMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [localMessage]);

    // Resetear tarjeta cuando cambia la cuenta
    useEffect(() => {
        if (transferDetails.cuentaOrigen) {
            setTransferDetails(prev => ({
                ...prev,
                tarjetaOrigen: ''
            }));
        }
    }, [transferDetails.cuentaOrigen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalMessage(null);
        setTransferDetails(prev => ({
            ...prev,
            [name]: name === 'cuentaOrigen' ? parseInt(value) || '' : value
        }));
    };

    const validateForm = () => {
        const {
            cuentaOrigen,
            tarjetaOrigen,
            cbuAlias,
            monto,
            motivo,
            nombreDestinatario,
            bancoDestino
        } = transferDetails;

        if (!cuentaOrigen) {
            return 'Debes seleccionar una cuenta de origen.';
        }

        if (!tarjetaOrigen) {
            return 'Debes seleccionar una tarjeta para realizar la transferencia.';
        }

        if (!nombreDestinatario || !bancoDestino || !cbuAlias || !motivo) {
            return 'Todos los campos del destinatario son obligatorios.';
        }

        if (!monto) {
            return 'Debes ingresar un monto.';
        }

        const numericAmount = parseFloat(monto);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return 'El monto debe ser un número positivo.';
        }

        if (numericAmount > availableBalance) {
            return `Saldo insuficiente. Tienes $${availableBalance.toFixed(2)} disponibles.`;
        }

        return null;
    };

    const handleSubmitTransfer = async (e) => {
        e.preventDefault();
        setLocalMessage(null);

        // Validar formulario
        const validationError = validateForm();
        if (validationError) {
            setLocalMessage({ type: 'error', text: validationError });
            return;
        }

        // Preparar datos para el backend
        const transferData = {
            tipoTransferencia: transferDetails.tipoTransferencia,
            motivo: transferDetails.motivo,
            nombreDestinatario: transferDetails.nombreDestinatario,
            bancoDestino: transferDetails.bancoDestino,
            cuentaDestinatario: transferDetails.cbuAlias,
            cuentaOrigen: transferDetails.cuentaOrigen,
            monto: parseFloat(transferDetails.monto),
            estado: true
        };

        try {
            // Obtener la primera tarjeta asociada a la cuenta
            // const account = activeAccounts.find(acc => acc.idCuenta === parseInt(transferDetails.cuentaOrigen));
            // const tarjeta = account?.tarjetasDto?.[0];

            // if (!tarjeta) {
            //     throw new Error("No hay tarjetas disponibles para esta cuenta");
            // }

            // await createTransaction(tarjeta.idTarjeta, transferData);

            await createTransaction(parseInt(transferDetails.tarjetaOrigen), transferData);

            setLocalMessage({ type: 'success', text: '¡Transferencia realizada con éxito!' });

            // Limpiar el formulario
            setTransferDetails(INITIAL_TRANSFER_STATE);

        } catch (error) {
            console.error('Error al realizar la transferencia:', error);
            setLocalMessage({
                type: 'error',
                text: 'Error al realizar la transferencia: ' + (error.message || 'Inténtalo de nuevo')
            });
        }
    };


    return (
        <div className="flex justify-center items-start min-h-[calc(100vh-80px)] py-8 px-4">
            <div className="bg-[#2D3748] text-white p-8 rounded-xl shadow-lg w-full max-w-xl">
                <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3">
                    <IoSwapHorizontalSharp className="text-white text-[1.8rem]" />
                    Realizar Transferencia
                </h2>

                {/* <div className="text-lg text-center mb-6 py-3 px-4 rounded-lg bg-gray-700">
                    <p className="font-semibold">
                        Saldo Disponible: <span className="text-green-400">${availableBalance.toFixed(2)}</span>
                        {selectedAccount && ` (${selectedAccount.moneda})`}
                    </p>
                </div> */}

                {/* Mostrar saldo disponible */}
                <div className="text-lg text-center mb-6 py-3 px-4 rounded-lg bg-gray-700">
                    <p className="font-semibold">
                        Saldo Disponible:
                        <span className={`ml-2 ${selectedAccount ? 'text-green-400' : 'text-gray-400'}`}>
                            ${availableBalance.toFixed(2)}
                        </span>
                        {selectedAccount && (<span className="text-gray-300 ml-1">({selectedAccount.moneda})</span>)}
                    </p>
                    {!selectedAccount && (<p className="text-sm text-gray-400 mt-1">Selecciona una cuenta para ver el saldo</p>)}
                </div>

                <form onSubmit={handleSubmitTransfer} className="space-y-6">
                    {/* Cuenta de origen */}
                    <div>
                        <label htmlFor="cuentaOrigen" className="block text-lg font-medium mb-2 text-gray-300">
                            Cuenta Origen
                        </label>
                        <select
                            id="cuentaOrigen"
                            name="cuentaOrigen"
                            value={transferDetails.cuentaOrigen}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            required
                        >
                            <option value="">Selecciona una cuenta...</option>
                            {activeAccounts.map(account => (
                                <option key={account.idCuenta} value={account.idCuenta}>
                                    {`${account.moneda} - ${account.cbu.substring(0, 8)}... (Saldo: $${parseFloat(account.saldo).toLocaleString('es-AR')})`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de Tarjeta */}
                    <div>
                        <label htmlFor="tarjetaOrigen" className="block text-lg font-medium mb-2 text-gray-300">
                            <IoCard className="inline mr-2" />
                            Tarjeta de Origen
                        </label>
                        <select
                            id="tarjetaOrigen"
                            name="tarjetaOrigen"
                            value={transferDetails.tarjetaOrigen}
                            onChange={handleInputChange}
                            disabled={!selectedAccount || availableCards.length === 0}
                            className={`w-full px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white ${!selectedAccount || availableCards.length === 0
                                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                                : 'bg-gray-700'
                                }`}
                            required
                        >
                            <option value="">
                                {!selectedAccount
                                    ? 'Primero selecciona una cuenta...'
                                    : availableCards.length === 0
                                        ? 'No hay tarjetas disponibles'
                                        : 'Selecciona una tarjeta...'
                                }
                            </option>
                            {availableCards.map(card => (
                                <option key={card.idTarjeta} value={card.idTarjeta}>
                                    {`${card.marca} - **** ${card.numeroTarjeta?.slice(-4)} (${card.tipo})`}
                                </option>
                            ))}
                        </select>
                        {selectedAccount && availableCards.length === 0 && (
                            <p className="text-sm text-red-400 mt-2">
                                Esta cuenta no tiene tarjetas activas asociadas.
                            </p>
                        )}
                    </div>


                    {/* Nombre del destinatario */}
                    <div>
                        <label htmlFor="nombreDestinatario" className="block text-lg font-medium mb-2 text-gray-300">
                            Nombre del destinatario
                        </label>
                        <input
                            type="text"
                            id="nombreDestinatario"
                            name="nombreDestinatario"
                            value={transferDetails.nombreDestinatario}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                            placeholder="Ej: Juan Pérez"
                            required
                        />
                    </div>

                    {/* Banco destino */}
                    <div>
                        <label htmlFor="bancoDestino" className="block text-lg font-medium mb-2 text-gray-300">
                            Banco destino
                        </label>
                        <input
                            type="text"
                            id="bancoDestino"
                            name="bancoDestino"
                            value={transferDetails.bancoDestino}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                            placeholder="Ej: Banco Nación"
                            required
                        />
                    </div>

                    {/* CBU / Alias del destinatario */}
                    <div>
                        <label htmlFor="cbuAlias" className="block text-lg font-medium mb-2 text-gray-300">
                            CBU / Alias del Destinatario
                        </label>
                        <input
                            type="text"
                            id="cbuAlias"
                            name="cbuAlias"
                            value={transferDetails.cbuAlias}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                            placeholder="Ej: 0000000000000000000000 / mi.alias.personal"
                            required
                        />
                    </div>

                    {/* Campo Monto */}
                    <div>
                        <label htmlFor="monto" className="block text-lg font-medium mb-2 text-gray-300">
                            Monto a Transferir
                        </label>
                        <input
                            type="number"
                            id="monto"
                            name="monto"
                            value={transferDetails.monto}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                            placeholder="Ej: 5000.00"
                            step="0.01"
                            min="0.01"
                            max={availableBalance}
                            required
                        />
                        {selectedAccount && (
                            <p className="text-sm text-gray-400 mt-1">
                                Máximo disponible: ${availableBalance.toFixed(2)}
                            </p>
                        )}
                    </div>

                    {/* Campo Motivo / Descripción */}
                    <div>
                        <label htmlFor="motivo" className="block text-lg font-medium mb-2 text-gray-300">
                            Motivo / Descripción
                        </label>
                        <input
                            type="text"
                            id="motivo"
                            name="motivo"
                            value={transferDetails.motivo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                            placeholder="Ej: Pago de alquiler / Cena"
                            maxLength="50"
                            required
                        />
                    </div>

                    {/* Mensaje de éxito/error */}
                    {localMessage && (
                        <div className={`mt-4 p-3 rounded-lg text-center font-medium flex items-center justify-center gap-2 ${localMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                            {localMessage.type === 'success' ? <IoCheckmarkCircle size={20} /> : <IoWarning size={20} />}
                            <span>{localMessage.text}</span>
                        </div>
                    )}

                    {/* Botón Realizar Transferencia */}
                    <button
                        type="submit"
                        disabled={!canTransfer || isLoading}
                        className={`w-full font-semibold py-3 rounded-lg transition-all duration-300 shadow-md flex items-center justify-center gap-2 mt-8 ${canTransfer && !isLoading
                            ? 'bg-[linear-gradient(to_right,_#FF9A9E,_#F6416C)] hover:opacity-90 hover:scale-105 text-[#2D3748]'
                            : 'bg-gray-600 cursor-not-allowed opacity-50 text-gray-300'
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-300"></span>
                                Enviando...
                            </>
                        ) : !canTransfer ? (
                            <>
                                <IoWarning className="text-[1.3rem]" />
                                {!selectedAccount
                                    ? 'Selecciona una cuenta'
                                    : availableCards.length === 0
                                        ? 'No hay tarjetas disponibles'
                                        : 'Selecciona una tarjeta'
                                }
                            </>
                        ) : (
                            <>
                                <IoArrowForward className="text-[1.3rem]" />
                                Realizar Transferencia
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};