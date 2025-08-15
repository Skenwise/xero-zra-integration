import '../App.css';
import {useState} from 'react';

interface Field {
    label: string;
    name: string;
    type: string;
}

interface CreateItemProps {
    title: string;
    fields: Field[];
    apiEndpoint: string;
    onSubmit: (formData: Record<string, any>) => void;
    onClose: () => void;
    dataProcessor?: (formData: Record<string, any>) => Record<string, any>;
}

export default function CreateItemModel({title, fields, apiEndpoint,onSubmit, onClose, dataProcessor}: CreateItemProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const processedData = dataProcessor ? dataProcessor(formData) : formData;

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                credentials: 'include',
                headers: {'Content-type': 'application/json',},
                body: JSON.stringify(processedData)
            });

            if (!response.ok) throw new Error(`Http Error! status: ${response.status}`);

            const result = await response.json()
            console.log('Data created successfully: ', result)

            onSubmit(processedData)

            onClose();

        } catch (error) {
            console.error("Failed to create Data: ", error);
        }
    };

    return (
        <div className="model-overplay">
            <div className="model-container">
                <h2>{title}</h2>
                <form onSubmit={handleSubmit}>
                    {fields.map((field, idx) => (
                        <div key={idx} className="modal-field">
                            <label>{field.label}</label>
                            <input type={field.type} name={field.name} value={formData[field.name] || ''} onChange={handleChange} required />
                        </div>
                    ))}
                    <div className="model-buttons">
                        <button type="submit">Submit</button>
                        <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
                    </div>
               </form>
           </div>
        </div>
    );
}
        


