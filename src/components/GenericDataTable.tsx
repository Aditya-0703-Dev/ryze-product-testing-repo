import * as React from "react";
import {
	ColumnDef,
	flexRender,
	SortingState,
	getSortedRowModel,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RoundSpinner } from "./ui/spinner";
import { Progress } from "./ui/progress";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	filterKey: keyof TData;
	rowIdKey?: (keyof TData)[];
	rowLinkPrefix?: string;
	isLoading?: boolean;
	onRowClick?: (row: TData) => void;
}

export function GenericDataTable<TData, TValue>({
	columns,
	data,
	filterKey,
	rowIdKey = [],
	rowLinkPrefix = "#",
	isLoading = false,
	onRowClick,
}: DataTableProps<TData, TValue>) {
	const [filter, setFilter] = React.useState("");
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const navigate = useNavigate();

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			globalFilter: filter,
			sorting,
		},
		onGlobalFilterChange: setFilter,
		globalFilterFn: (row, columnId, filterValue) => {
			const value = row.original[filterKey];
			return value
				?.toString()
				.toLowerCase()
				.includes(filterValue.toLowerCase());
		},
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
	});

	const handleRowClick = (row: TData) => {
		if (rowIdKey && rowLinkPrefix !== "#") {
			const ids = rowIdKey
				.map((key) => row[key])
				.filter((val) => val !== null);
			if (ids.length === rowIdKey.length) {
				navigate(`${rowLinkPrefix}${ids.join("/")}`, {
					state: { pageData: row },
				});
			}
		} else {
			onRowClick?.(row);
		}
	};

	return (
		<div className="space-y-4 px-4 max-w-7xl w-full">
			<Input
				placeholder="Search..."
				value={filter}
				onChange={(e) => setFilter(e.target.value)}
				className="max-w-sm text-xl"
			/>
			<div className="rounded-md border">
				<Table className="rounded-md bg-zinc-900">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow
								key={headerGroup.id}
								className="bg-[#404040] hover:bg-[#404040] transition-opacity"
							>
								{headerGroup.headers.map((header, index) => (
									<TableHead
										key={header.id}
										className={`text-white text-base
											${
												index === 0
													? "rounded-tl-md"
													: index ===
													  headerGroup.headers
															.length -
															1
													? "rounded-tr-md"
													: ""
											}
										`}
									>
										{flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody className="">
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									onClick={() => handleRowClick(row.original)}
									className="cursor-pointer hover:bg-zinc-800 transition text-white/70"
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{typeof cell.getValue() ===
											"number" ? (
												// Render a progress bar for Number columns
												<div className="rounded-full text-center flex items-center justify-center min-w-[62px] h-[26px] w-fit bg-[#404040]">
													{cell.getValue() as number}
												</div>
											) : typeof cell.getValue() ===
											  "string" ? (
												// Truncate long text to 50 words
												<div className="text-wrap">
													{(cell.getValue() as string)
														.split(" ")
														.slice(0, 30)
														.join(" ")}
													{(
														cell.getValue() as string
													).split(" ").length > 30 &&
														"..."}
												</div>
											) : (
												// Render default cell content for other types
												flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="text-center"
								>
									{isLoading ? (
										<RoundSpinner />
									) : (
										"No results found."
									)}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex justify-between items-center">
				<div className="text-sm text-muted-foreground">
					Page {table.getState().pagination.pageIndex + 1} of{" "}
					{table.getPageCount()}
				</div>
				{table.getPageCount() > 1 && (
					<div className="space-x-2">
						{table.getState().pagination.pageIndex !== 0 && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								Previous
							</Button>
						)}
						<Button
							variant="default"
							className="bg-sky-500 hover:bg-sky-600 text-white"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							Next
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
