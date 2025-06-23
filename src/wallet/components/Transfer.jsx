import { useEffect, useState } from 'react';
import {
    IoArrowForward,
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


const Transfer = () => {

    // Asumiendo que tienes un hook para obtener las cuentas
    const { accounts } = useAccountStore();
    const { createTransaction } = useTransactionStore();
    const [localMessage, setLocalMessage] = useState(null);
    const [isSending] = useState(false);
    const [transferDetails, setTransferDetails] = useState(INITIAL_TRANSFER_STATE);


    // Filtrar solo cuentas activas
    const activeAccounts = accounts.filter(account => account.estado !== false);

    // Encontrar la cuenta seleccionada
    const selectedAccount = activeAccounts.find(acc => acc.idCuenta === transferDetails.cuentaOrigen);

    // Determinar el saldo disponible
    const availableBalance = selectedAccount ? selectedAccount.saldo : 0;

    useEffect(() => {
        if (localMessage) {
            const timer = setTimeout(() => setLocalMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [localMessage]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalMessage(null);
        setTransferDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitTransfer = async (e) => {
        e.preventDefault();
        setLocalMessage(null);

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
            const account = activeAccounts.find(acc => acc.idCuenta === parseInt(transferDetails.cuentaOrigen));
            const tarjeta = account?.tarjetasDto?.[0];

            if (!tarjeta) {
                throw new Error("No hay tarjetas disponibles para esta cuenta");
            }

            await createTransaction(tarjeta.idTarjeta, transferData);

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

                <div className="text-lg text-center mb-6 py-3 px-4 rounded-lg bg-gray-700">
                    <p className="font-semibold">
                        Saldo Disponible: <span className="text-green-400">${availableBalance.toFixed(2)}</span>
                        {selectedAccount && ` (${selectedAccount.moneda})`}
                    </p>
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

                    {/* Tipo de transferencia */}
                    <div>
                        <label htmlFor="tipoTransferencia" className="block text-lg font-medium mb-2 text-gray-300">
                            Tipo de transferencia
                        </label>
                        <select
                            id="tipoTransferencia"
                            name="tipoTransferencia"
                            value={transferDetails.tipoTransferencia}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            required
                        >
                            <option value="debito">Débito</option>
                            <option value="credito">Crédito</option>
                        </select>
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

                    {/* Selector de Tarjeta de Origen */}
                    {/* <div>
                        <label htmlFor="sourceCardId" className="block text-lg font-medium mb-2 text-gray-300">
                            Seleccionar Tarjeta de Origen
                        </label>
                        <select
                            id="sourceCardId"
                            name="sourceCardId"
                            value={transferDetails.sourceCardId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            required
                        >
                            <option value="">Selecciona una tarjeta...</option>
                            {allCards.map(card => (
                                <option key={card.id} value={card.id}>
                                 
                                    {`${card.banco} - ${card.tipo} <span class="math-inline">\{card\.numero\.slice\(\-4\)\} \(</span>{card.marca || 'N/A'}) (Cuenta ${card.accountMoneda})`}
                                </option>
                            ))}
                        </select>
                        {allCards.length === 0 && (
                            <p className="text-sm text-gray-500 mt-2 text-red-400">
                                No se encontraron tarjetas asociadas a tus cuentas.
                            </p>
                        )}
                    </div> */}

                    {/* Campo Monto */}
                    <div>
                        <label htmlFor="monto" className="block text-lg font-medium mb-2 text-gray-300">
                            Monto a Transferir
                        </label>
                        <input
                            type="text"
                            id="monto"
                            name="monto"
                            value={transferDetails.monto}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                            placeholder="Ej: 5000.00"
                            step="0.01"
                            min="0.01"
                            required
                        />
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
                        className={`w-full bg-[linear-gradient(to_right,_#FF9A9E,_#F6416C)] hover:opacity-90 text-[#2D3748] font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-md flex items-center justify-center gap-2 mt-8
                                    ${isSending ? 'opacity-60 cursor-not-allowed' : ''}`}
                        disabled={isSending}
                    >
                        {isSending ? (
                            <>
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#2D3748]"></span>
                                Enviando...
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

export default Transfer;