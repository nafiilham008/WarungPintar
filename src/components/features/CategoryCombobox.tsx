'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { getCategoriesAction } from '@/actions/categories'

export function CategoryCombobox({ name, defaultValue }: { name: string, defaultValue?: string }) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(defaultValue || "")
    const [categories, setCategories] = React.useState<string[]>([])
    const [inputValue, setInputValue] = React.useState("")

    React.useEffect(() => {
        getCategoriesAction().then(setCategories)
    }, [])

    return (
        <div className="flex flex-col gap-2">
            {/* Hidden input to actually submit the form data */}
            <input type="hidden" name={name} value={value} />

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-slate-50 border-slate-200 font-normal hover:bg-slate-100"
                    >
                        {value ? value : "Pilih atau ketik kategori..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="p-0"
                    align="start"
                    style={{ width: 'var(--radix-popover-trigger-width)' }}
                >
                    <Command>
                        <CommandInput
                            placeholder="Cari kategori..."
                            onValueChange={(v) => {
                                setInputValue(v)
                            }}
                        />
                        <CommandList className="max-h-[200px] overflow-y-auto custom-scrollbar">
                            <CommandEmpty className="py-2 px-4 text-sm">
                                {inputValue ? (
                                    <div
                                        className="flex items-center gap-2 cursor-pointer text-emerald-600 font-medium"
                                        onClick={() => {
                                            const newValue = inputValue.charAt(0).toUpperCase() + inputValue.slice(1) // Simple Capitalize
                                            setValue(newValue)
                                            setOpen(false)
                                        }}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Buat baru: &quot;{inputValue}&quot;
                                    </div>
                                ) : (
                                    <span className="text-slate-500">Ketik untuk menambah baru.</span>
                                )}
                            </CommandEmpty>
                            <CommandGroup>
                                {categories.map((category) => (
                                    <CommandItem
                                        key={category}
                                        value={category}
                                        onSelect={(currentValue) => {
                                            // Prefer the displayed category label to keep casing nice
                                            setValue(category)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === category ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {category}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
